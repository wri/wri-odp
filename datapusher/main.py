import json
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


MINIMUM_QSV_VERSION = "0.108.0"

DATASTORE_URLS = {
    "datastore_delete": "{ckan_url}/api/action/datastore_delete",
    "resource_update": "{ckan_url}/api/action/resource_update",
}


@flow(log_prints=True)
def push_to_datastore(resource_id, api_key):
    logger = get_run_logger()
    qsv_bin = "/home/luccas/.cargo/bin/qsvdp"
    file_bin = "/usr/bin/file"
    check_qsv(qsv_bin, file_bin)
    get_resource = GetResource(
        resource_id=resource_id,
        ckan_url="http://ckan-dev:5000",
        api_key=api_key
    )
    resource = get_resource_metadata(get_resource)
    with tempfile.TemporaryDirectory() as temp_dir:
        timer_start = time.perf_counter()
        new_resource, tmp_file, fetch_elapsed = download_resource(
            Resource(**resource), get_resource, temp_dir
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


if __name__ == "__main__":
    datastore_deployment = push_to_datastore.to_deployment(
        name="datapusher",
        parameters={"resource_id": "test_id", "api_key": "api_key"},
        enforce_parameter_schema=False,
        is_schedule_active=False,
    )
    serve(datastore_deployment)
