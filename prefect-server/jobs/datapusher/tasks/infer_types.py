from prefect import get_run_logger
import subprocess
import os
import csv
from prefect import task, get_run_logger
from config import config
from helpers import datastore_resource_exists, delete_datastore_resource

from models import GetResource

POSTGRES_INT_MAX = 2147483647
POSTGRES_INT_MIN = -2147483648
POSTGRES_BIGINT_MAX = 9223372036854775807
POSTGRES_BIGINT_MIN = -9223372036854775808


def infer_types(
    tmp,
    qsv_bin,
    record_count,
    temp_dir,
    get_resource: GetResource,
    original_header_dict,
):
    logger = get_run_logger()
    try:
        qsv_index_file = tmp + ".idx"
        subprocess.run([qsv_bin, "index", tmp], check=True)
    except subprocess.CalledProcessError as e:
        raise Exception("Cannot index CSV: {}".format(e))

    # if SORT_AND_DUPE_CHECK = True, we already know the record count
    # so we can skip qsv count.
        # get record count, this is instantaneous with an index
    try:
        qsv_count = subprocess.run(
            [qsv_bin, "count", tmp], capture_output=True, check=True, text=True
        )
    except subprocess.CalledProcessError as e:
        raise Exception("Cannot count records in CSV: {}".format(e))
    record_count = int(str(qsv_count.stdout).strip())

    # its empty, nothing to do
    if record_count == 0:
        logger.warning("Upload skipped as there are zero records.")
        return

    # log how many records we detected
    unique_qualifier = ""
    logger.info("{:,} {} records detected...".format(record_count, unique_qualifier))

    # run qsv stats to get data types and summary statistics
    logger.info("Inferring data types and compiling statistics...")
    headers = []
    types = []
    headers_min = []
    headers_max = []
    headers_cardinality = []
    qsv_stats_csv = os.path.join(temp_dir, "qsv_stats.csv")
    qsv_stats_cmd = [
        qsv_bin,
        "stats",
        tmp,
        "--infer-dates",
        "--dates-whitelist",
        "all",
        "--output",
        qsv_stats_csv,
    ]
    prefer_dmy = config.get("PREFER_DMY")
    if prefer_dmy:
        qsv_stats_cmd.append("--prefer-dmy")
    auto_index_threshold = config.get("AUTO_INDEX_THRESHOLD")
    if auto_index_threshold:
        qsv_stats_cmd.append("--cardinality")
    summary_stats_options = config.get("SUMMARY_STATS_OPTIONS")
    if summary_stats_options:
        qsv_stats_cmd.append(summary_stats_options)

    try:
        subprocess.run(qsv_stats_cmd, check=True)
    except subprocess.CalledProcessError as e:
        raise Exception(
            "Cannot infer data types and compile statistics: {}".format(e)
        )

    with open(qsv_stats_csv, mode="r") as inp:
        reader = csv.DictReader(inp)
        for row in reader:
            headers.append(row["field"])
            types.append(row["type"])
            headers_min.append(row["min"])
            headers_max.append(row["max"])
            if auto_index_threshold:
                headers_cardinality.append(int(row["cardinality"]))

    existing = datastore_resource_exists(get_resource.resource_id, get_resource.api_key, get_resource.ckan_url)
    existing_info = None
    if existing:
        existing_info = dict(
            (f["id"], f["info"]) for f in existing.get("fields", []) if "info" in f
        )

    # if this is an existing resource
    # override with types user requested in Data Dictionary
    if existing_info:
        types = [
            {
                "text": "String",
                "numeric": "Float",
                "timestamp": "DateTime",
            }.get(existing_info.get(h, {}).get("type_override"), t)
            for t, h in zip(types, headers)
        ]

    # Delete existing datastore resource before proceeding.
    if existing:
        logger.info(
            'Deleting existing resource "{res_id}" from datastore.'.format(
                res_id=get_resource.resource_id
            )
        )
        delete_datastore_resource(get_resource.resource_id, get_resource.api_key, get_resource.ckan_url)

    # 1st pass of building headers_dict
    # here we map inferred types to postgresql data types
    type_mapping = config.get("TYPE_MAPPING")
    temp_headers_dicts = [
        dict(id=field[0], type=type_mapping[str(field[1])])
        for field in zip(headers, types)
    ]

    # 2nd pass header_dicts, checking for smartint types.
    # "smartint" will automatically select the best integer data type based on the
    # min/max values of the column we got from qsv stats.
    # We also set the Data Dictionary Label to original column names in case we made
    # the names "db-safe" as the labels are used by DataTables_view to label columns
    # we also add an empty "unit" field so data can be annotated with units
    # we also take note of datetime/timestamp fields, so we can normalize them
    # to RFC3339 format, which is Postgres COPY ready
    datetimecols_list = []
    headers_dicts = []
    for idx, header in enumerate(temp_headers_dicts):
        if header["type"] == "smartint":
            if (
                int(headers_max[idx]) <= POSTGRES_INT_MAX
                and int(headers_min[idx]) >= POSTGRES_INT_MIN
            ):
                header_type = "integer"
            elif (
                int(headers_max[idx]) <= POSTGRES_BIGINT_MAX
                and int(headers_min[idx]) >= POSTGRES_BIGINT_MIN
            ):
                header_type = "bigint"
            else:
                header_type = "numeric"
        else:
            header_type = header["type"]
        if header_type == "timestamp":
            datetimecols_list.append(header["id"])
        info_dict = dict(label=original_header_dict.get(idx, "Unnamed Column"))
        headers_dicts.append(
            dict(id=header["id"], type=header_type, info=info_dict, unit="")
        )

    # Maintain data dictionaries from matching column names
    # if data dictionary already exists for this resource as
    # we want to preserve the user's data dictionary curations
    if existing_info:
        for h in headers_dicts:
            if h["id"] in existing_info:
                h["info"] = existing_info[h["id"]]
                # create columns with types user requested
                type_override = existing_info[h["id"]].get("type_override")
                if type_override in list(type_mapping.values()):
                    h["type"] = type_override

    logger.info(
        "Determined headers and types: {headers}...".format(headers=headers_dicts)
    )
    return tmp, headers_dicts, datetimecols_list, headers_cardinality, headers
