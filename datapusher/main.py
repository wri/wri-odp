from itertools import chain
import json
import os
import tempfile
import time
from datasize import DataSize
from prefect import flow, get_run_logger, serve
from models import GetResource, Resource
from config import config

from tasks.check_qsv import check_qsv
from tasks.copy_to_datastore import copy_to_datastore
from tasks.download_resource import download_resource
from tasks.get_headers import get_headers
from tasks.get_resource_metadata import get_resource_metadata
from tasks.infer_types import infer_types
from tasks.normalize_resource import normalize_resource
from tasks.normalize_timestamps import normalize_timestamps
from tasks.sort_and_dedup import sort_and_dedup
from tasks.validate_csv import validate_csv
from tasks.data_to_file import data_to_file
from tasks.s3_upload import s3_upload
from tasks.zip_files import download_keys

from tasks.send_callback import send_callback
from tasks.query_datastore import query_datastore, query_rw, query_subset_datastore


MINIMUM_QSV_VERSION = "0.108.0"

DATASTORE_URLS = {
    "datastore_delete": "{ckan_url}/api/action/datastore_delete",
    "resource_update": "{ckan_url}/api/action/resource_patch",
}


@flow(log_prints=True)
def push_to_datastore(resource_id, api_key):
    logger = get_run_logger()
    qsv_bin = config.get("QSV_BIN")
    file_bin = config.get("FILE_BIN")
    ckan_url = config.get("CKAN_URL")
    check_qsv(qsv_bin, file_bin)
    get_resource = GetResource(
        resource_id=resource_id, ckan_url=ckan_url, api_key=api_key
    )
    resource = get_resource_metadata(get_resource)
    with tempfile.TemporaryDirectory() as temp_dir:
        timer_start = time.perf_counter()
        new_resource, tmp_file, fetch_elapsed = download_resource(
            resource, get_resource, temp_dir
        )
        fetch_elapsed = time.perf_counter() - timer_start
        analysis_start = time.perf_counter()
        tmp_file = normalize_resource(
            new_resource, temp_dir, qsv_bin, file_bin, tmp_file
        )
        tmp_file = validate_csv(tmp_file, qsv_bin)
        tmp_file, record_count = sort_and_dedup(tmp_file, qsv_bin, temp_dir)
        tmp_file, qsv_headers, original_header_dicts = get_headers(
            tmp_file, temp_dir, qsv_bin
        )
        data_dictionary = (
            resource.get("schema").get("value", None)
            if resource.get("schema")
            else None
        )
        (
            tmp_file,
            header_dicts,
            datetime_cols_list,
            headers_cardinality,
            headers,
        ) = infer_types(
            tmp_file,
            qsv_bin,
            record_count,
            temp_dir,
            get_resource,
            original_header_dicts,
            data_dictionary,
        )
        tmp_file = normalize_timestamps(tmp_file, qsv_bin, temp_dir, datetime_cols_list)
        analysis_elapsed = time.perf_counter() - analysis_start
        logger.info(
            "ANALYSIS DONE! Analyzed and prepped in {:,.2f} seconds.".format(
                analysis_elapsed
            )
        )
        rows_to_copy = record_count
        print("TMP File", tmp_file)
        # Copy to datastore
        copy_elapsed, metadata_elapsed, index_elapsed = copy_to_datastore(
            tmp_file,
            rows_to_copy,
            new_resource,
            get_resource.api_key,
            get_resource.ckan_url,
            header_dicts,
            record_count,
            datetime_cols_list,
            headers_cardinality,
            headers,
        )
        total_elapsed = time.perf_counter() - timer_start
        end_msg = f"""
        DATAPUSHER+ JOB DONE!
          Download: {fetch_elapsed:,.2f}
          Analysis: {analysis_elapsed:,.2f}          
          Copiyng: {copy_elapsed:,.2f}
          Metadata updates: {metadata_elapsed:,.2f}
          Indexing: {index_elapsed:,.2f}
        TOTAL ELAPSED TIME: {total_elapsed:,.2f}
        """
        logger.info(end_msg)


@flow(log_prints=True)
def convert_store_to_file(
    resource_id,
    api_key,
    task_id,
    provider,
    sql,
    rw_id,
    carto_account,
    format,
    filename,
    download_filename,
):
    logger = get_run_logger()
    ckan_url = config.get("CKAN_URL")

    logger.info("Fetching data...")
    data = query_datastore(
        api_key, ckan_url, sql, provider, rw_id, carto_account, format
    )
    with tempfile.TemporaryDirectory() as tmp_dir:
        logger.info("Converting data..." + " " + format)
        tmp_filepath = os.path.join(tmp_dir, filename)
        data_to_file(data, tmp_filepath, format)

        logger.info("Uploading data...")
        url = s3_upload(
            tmp_filepath, "_downloads_cache/{}".format(filename), download_filename
        )

    # TODO: send error/success (send status)
    send_callback(
        api_key,
        ckan_url,
        "prefect_download_callback",
        {
            "task_id": task_id,
            "url": url,
            "state": "complete",
            "entity_id": resource_id,
            "key": format,
        },
    )


@flow(log_prints=True)
async def download_subset_of_data(
    id,
    api_key,
    task_id,
    provider,
    sql,
    format,
    filename,
    download_filename,
    connector_url,
    dataset_id,
    num_of_rows,
):
    logger = get_run_logger()
    ckan_url = config.get("CKAN_URL")

    logger.info("Fetching data...")
    data = []
    if provider == "datastore":
        tasks = await query_subset_datastore(id, sql, num_of_rows, ckan_url)
        data = list(chain.from_iterable(tasks))
    else:
        tasks = await query_rw(id, sql, connector_url, provider, num_of_rows)
        data = list(chain.from_iterable(tasks))
    with tempfile.TemporaryDirectory() as tmp_dir:
        logger.info("Converting data..." + " " + format)
        tmp_filepath = os.path.join(tmp_dir, filename)
        data_to_file(data, tmp_filepath, format)
        logger.info("Uploading data...")
        url = s3_upload(
            tmp_filepath, "_downloads_cache/{}".format(filename), download_filename
        )

    # TODO: send error/success (send status)
    send_callback(
        api_key,
        ckan_url,
        "prefect_download_subset_callback",
        {
            "task_id": task_id,
            "url": url,
            "state": "complete",
            "entity_id": id if provider == "datastore" else dataset_id,
            "key": filename,
        },
    )


@flow(log_prints=True)
async def download_resources_zipped(
    dataset_id,
    api_key,
    task_id,
    keys,
    filename,
    download_filename,
):
    logger = get_run_logger()
    ckan_url = config.get("CKAN_URL")
    with tempfile.TemporaryDirectory() as temp_dir:
        zipped_file = download_keys(keys, filename, temp_dir)
        tmp_filepath = os.path.join(temp_dir, zipped_file)
        logger.info("Uploading data...")
        url = s3_upload(
            tmp_filepath, "_downloads_cache/{}".format(f"{filename}.zip"), f"{download_filename}.zip"
        )
    logger.info("Uploading data...")
    send_callback(
        api_key,
        ckan_url,
        "prefect_download_zipped_callback",
        {
            "task_id": task_id,
            "url": url,
            "state": "complete",
            "entity_id": dataset_id,
            "key": filename,
        },
    )


if __name__ == "__main__":
    datastore_deployment = push_to_datastore.to_deployment(
        name=config.get("DEPLOYMENT_NAME"),
        parameters={"resource_id": "test_id", "api_key": "api_key"},
        enforce_parameter_schema=False,
        is_schedule_active=False,
    )
    download_zipped_deployment = download_resources_zipped.to_deployment(
        name=config.get("DEPLOYMENT_NAME"),
        parameters={
            "dataset_id": "test_id",
            "api_key": "api_key",
            "task_id": "task_id",
            "keys": ["key 1", "key 2"],
            "filename": "filename",
            "download_filename": "download_filename",
        },
        enforce_parameter_schema=False,
        is_schedule_active=False,
    )
    conversion_deployment = convert_store_to_file.to_deployment(
        name=config.get("DEPLOYMENT_NAME"),
        parameters={
            "resource_id": "test_id",
            "api_key": "api_key",
            "task_id": "task_id",
            "provider": "provider",
            "sql": "sql",
            "rw_id": "rw_id",
            "carto_account": "carto_account",
            "format": "format",
            "filename": "filename",
            "download_filename": "download_filename",
        },
        enforce_parameter_schema=False,
        is_schedule_active=False,
    )
    download_subset_deployment = download_subset_of_data.to_deployment(
        name=config.get("DEPLOYMENT_NAME"),
        parameters={
            "id": "test_id",
            "api_key": "api_key",
            "task_id": "task_id",
            "provider": "provider",
            "sql": "sql",
            "format": "format",
            "num_of_rows": "count",
            "filename": "filename",
            "dataset_id": "dataset_id",
            "connector_url": "https://wri-01.carto.com/tables/wdpa_protected_areas/table",
            "download_filename": "download_filename",
        },
        enforce_parameter_schema=False,
        is_schedule_active=False,
    )
    serve(
        datastore_deployment,
        conversion_deployment,
        download_subset_deployment,
        download_zipped_deployment,
    )
