import time
from prefect import get_run_logger, task
import psycopg2
from psycopg2 import sql
from config import config

from helpers import get_package, send_resource_to_datastore, update_resource
from models import Resource

@task()
def copy_to_datastore(tmp, rows_to_copy, resource: Resource, api_key: str, ckan_url: str, headers_dicts, record_count: int, datetimecols_list, headers_cardinality, headers):
    logger = get_run_logger()
    # ============================================================
    # COPY to Datastore
    # ============================================================
    copy_start = time.perf_counter()

    logger.info("COPYING {:,} rows to Datastore...".format(rows_to_copy))

    # first, let's create an empty datastore table w/ guessed types
    send_resource_to_datastore(
        resource=None,
        resource_id=resource.id,
        headers=headers_dicts,
        api_key=api_key,
        ckan_url=ckan_url,
        records=None,
        aliases=None,
        calculate_record_count=False,
    )

    copied_count = 0
    try:
        raw_connection = psycopg2.connect(config.get("WRITE_ENGINE_URL"))
    except psycopg2.Error as e:
        raise Exception("Could not connect to the Datastore: {}".format(e))
    else:
        cur = raw_connection.cursor()
        """
        truncate table to use copy freeze option and further increase
        performance as there is no need for WAL logs to be maintained
        https://www.postgresql.org/docs/current/populate.html#POPULATE-COPY-FROM
        """
        try:
            cur.execute(
                sql.SQL("TRUNCATE TABLE {}").format(sql.Identifier(resource.id))
            )

        except psycopg2.Error as e:
            logger.warning("Could not TRUNCATE: {}".format(e))

        col_names_list = [h["id"] for h in headers_dicts]
        column_names = sql.SQL(",").join(sql.Identifier(c) for c in col_names_list)
        copy_sql = sql.SQL(
            "COPY {} ({}) FROM STDIN "
            "WITH (FORMAT CSV, FREEZE 1, "
            "HEADER 1, ENCODING 'UTF8');"
        ).format(
            sql.Identifier(resource.id),
            column_names,
        )
        with open(tmp, "rb") as f:
            try:
                cur.copy_expert(copy_sql, f)
            except psycopg2.Error as e:
                raise Exception("Postgres COPY failed: {}".format(e))
            else:
                copied_count = cur.rowcount

        raw_connection.commit()
        # this is needed to issue a VACUUM ANALYZE
        raw_connection.set_isolation_level(
            psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT
        )
        analyze_cur = raw_connection.cursor()
        analyze_cur.execute(
            sql.SQL("VACUUM ANALYZE {}").format(sql.Identifier(resource.id))
        )
        analyze_cur.close()

    copy_elapsed = time.perf_counter() - copy_start
    logger.info(
        '...copying done. Copied {n} rows to "{res_id}" in {copy_elapsed} seconds.'.format(
            n="{:,}".format(copied_count),
            res_id=resource.id,
            copy_elapsed="{:,.2f}".format(copy_elapsed),
        )
    )

    # ============================================================
    # UPDATE METADATA
    # ============================================================
    metadata_start = time.perf_counter()
    logger.info("UPDATING RESOURCE METADATA...")

    # --------------------- AUTO-ALIASING ------------------------
    # aliases are human-readable, and make it easier to use than resource id hash
    # when using the Datastore API and in SQL queries
    auto_alias = config.get("AUTO_ALIAS")
    auto_alias_unique = config.get("AUTO_ALIAS_UNIQUE")
    alias = None
    if auto_alias:
        logger.info(
            "AUTO-ALIASING. Auto-alias-unique: {} ...".format(auto_alias_unique)
        )
        # get package info, so we can construct the alias
        package = get_package(resource.package_id, ckan_url, api_key)

        resource_name = resource.name
        package_name = package.name
        owner_org = package.organization
        owner_org_name = ""
        if owner_org:
            owner_org_name = owner_org.name
        if resource_name and package_name and owner_org_name:
            # we limit it to 55, so we still have space for sequence & stats suffix
            # postgres max identifier length is 63
            alias = f"{resource_name}-{package_name}-{owner_org_name}"[:55]
            # if AUTO_ALIAS_UNIQUE is true, check if the alias already exist, if it does
            # add a sequence suffix so the new alias can be created
            cur.execute(
                "SELECT COUNT(*), alias_of FROM _table_metadata where name like %s group by alias_of",
                (alias + "%",),
            )
            alias_query_result = cur.fetchone()
            if alias_query_result:
                alias_count = alias_query_result[0]
                existing_alias_of = alias_query_result[1]
            else:
                alias_count = 0
                existing_alias_of = ""
            if auto_alias_unique and alias_count > 1:
                alias_sequence = alias_count + 1
                while True:
                    # we do this, so we're certain the new alias does not exist
                    # just in case they deleted an older alias with a lower sequence #
                    alias = f"{alias}-{alias_sequence:03}"
                    cur.execute(
                        "SELECT COUNT(*), alias_of FROM _table_metadata where name like %s group by alias_of;",
                        (alias + "%",),
                    )
                    alias_exists = cur.fetchone()[0]
                    if not alias_exists:
                        break
                    alias_sequence += 1
            elif alias_count == 1:
                logger.warning(
                    'Dropping existing alias "{}" for resource "{}"...'.format(
                        alias, existing_alias_of
                    )
                )
                try:
                    cur.execute(
                        sql.SQL("DROP VIEW IF EXISTS {}").format(sql.Identifier(alias))
                    )
                except psycopg2.Error as e:
                    logger.warning("Could not drop alias/view: {}".format(e))

        else:
            logger.warning(
                "Cannot create alias: {}-{}-{}".format(
                    resource_name, package_name, owner_org
                )
            )
            alias = None

    resource = resource.dict()
    resource["datastore_active"] = True
    resource["total_record_count"] = record_count
    resource["preview"] = False
    resource["preview_rows"] = None
    update_resource(resource, ckan_url, api_key)

    # tell CKAN to calculate_record_count and set alias if set
    send_resource_to_datastore(
        resource=None,
        resource_id=resource["id"],
        headers=headers_dicts,
        api_key=api_key,
        ckan_url=ckan_url,
        records=None,
        aliases=alias,
        calculate_record_count=True,
    )

    if alias:
        logger.info('Created alias "{}" for "{}"...'.format(alias, resource['id']))

    metadata_elapsed = time.perf_counter() - metadata_start
    logger.info(
        "METADATA UPDATES DONE! Resource metadata updated in {:.2f} seconds.".format(
            metadata_elapsed
        )
    )

    # =================================================================================================
    # INDEXING
    # =================================================================================================
    # if AUTO_INDEX_THRESHOLD > 0 or AUTO_INDEX_DATES is true
    # create indices automatically based on summary statistics
    # For columns w/ cardinality = record_count, it's all unique values, create a unique index
    # If AUTO_INDEX_DATES is true, index all date columns
    # if a column's cardinality <= AUTO_INDEX_THRESHOLD, create an index for that column
    auto_index_dates = config.get("AUTO_INDEX_DATES")
    auto_index_threshold = config.get("AUTO_INDEX_THRESHOLD")
    auto_unique_index = config.get("AUTO_UNIQUE_INDEX")
    index_elapsed = 0.0
    if (
        auto_index_threshold
        or (auto_index_dates and datetimecols_list)
        or auto_unique_index
    ):
        index_start = time.perf_counter()
        logger.info(
            "AUTO-INDEXING. Auto-index threshold: {:,} unique value/s. Auto-unique index: {} Auto-index dates: {} ...".format(
                auto_index_threshold, auto_unique_index, auto_index_dates
            )
        )
        index_cur = raw_connection.cursor()

        # if auto_index_threshold == -1
        # we index all the columns
        if auto_index_threshold == -1:
            auto_index_threshold = record_count

        index_count = 0
        for idx, cardinality in enumerate(headers_cardinality):
            curr_col = headers[idx]
            if auto_index_threshold > 0 or auto_index_dates or auto_unique_index:
                if cardinality == record_count and auto_unique_index:
                    # all the values are unique for this column, create a unique index
                    unique_value_count = cardinality
                    logger.info(
                        'Creating UNIQUE index on "{}" for {:,} unique values...'.format(
                            curr_col, unique_value_count
                        )
                    )
                    try:
                        index_cur.execute(
                            sql.SQL("CREATE UNIQUE INDEX ON {} ({})").format(
                                sql.Identifier(resource['id']),
                                sql.Identifier(curr_col),
                            )
                        )
                    except psycopg2.Error as e:
                        logger.warning(
                            'Could not CREATE UNIQUE INDEX on "{}": {}'.format(
                                curr_col, e
                            )
                        )
                    index_count += 1
                elif cardinality <= auto_index_threshold or (
                    auto_index_dates and (curr_col in datetimecols_list)
                ):
                    # cardinality <= auto_index_threshold or its a date and auto_index_date is true
                    # create an index
                    if curr_col in datetimecols_list:
                        logger.info(
                            'Creating index on "{}" date column for {:,} unique value/s...'.format(
                                curr_col, cardinality
                            )
                        )
                    else:
                        logger.info(
                            'Creating index on "{}" for {:,} unique value/s...'.format(
                                curr_col, cardinality
                            )
                        )
                    try:
                        index_cur.execute(
                            sql.SQL("CREATE INDEX ON {} ({})").format(
                                sql.Identifier(resource['id']),
                                sql.Identifier(curr_col),
                            )
                        )
                    except psycopg2.Error as e:
                        logger.warning(
                            'Could not CREATE INDEX on "{}": {}'.format(curr_col, e)
                        )
                    index_count += 1

        index_cur.close()
        raw_connection.commit()

        logger.info("Vacuum Analyzing table to optimize indices...")

        # this is needed to issue a VACUUM ANALYZE
        raw_connection.set_isolation_level(
            psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT
        )
        analyze_cur = raw_connection.cursor()
        analyze_cur.execute(
            sql.SQL("VACUUM ANALYZE {}").format(sql.Identifier(resource['id']))
        )
        analyze_cur.close()

        index_elapsed = time.perf_counter() - index_start
        logger.info(
            '...indexing/vacuum analysis done. Indexed {n} column/s in "{res_id}" in {index_elapsed} seconds.'.format(
                n="{:,}".format(index_count),
                res_id=resource['id'],
                index_elapsed="{:,.2f}".format(index_elapsed),
            )
        )
    raw_connection.close()
    return copy_elapsed, metadata_elapsed, index_elapsed
