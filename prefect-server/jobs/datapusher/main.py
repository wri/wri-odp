import json
import tempfile
import time
from datasize import DataSize
from prefect import flow, get_run_logger
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
def push_to_datastore(resource_id: str):
    logger = get_run_logger()
    qsv_bin = "/home/luccas/.cargo/bin/qsvdp"
    file_bin = "/usr/bin/file"
    check_qsv(qsv_bin, file_bin)
    get_resource = GetResource(
        resource_id=resource_id,
        ckan_url="http://ckan-dev:5000",
        api_key="eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJqdGkiOiJXNk9vMVdzVlZCVHJVbXlIREgwVVJOMWhWMTZDU3UySW1LRy1fY3NmdFk0IiwiaWF0IjoxNzA0ODIwNDI3fQ.eOxSzNEZfDR3UBHGgKTCmp5t2ohgPOk98tEIefLs2ZkwKtsaKNnXCK3_GzfiAjUbfpohOlx2D72tFdyBVy-qK-8AcUS3h28gnuCiHUTmy2M2IZ4g5fEGfLyzB3jxToTRnyXsE92ohxemX_L-xjf70iKkiECER_1_YB_-KfthH42pGjCPyLW3e0BpxHa88_XL11HCDosnSWnNT_m1iRZctW67RLuhEWsMDBpPjJFWqUf-BjPLs3LYrs2OjWAR-DDiG8S7sx8slMYF641WeoDOvMxMV1R-w6ZMxJidfovxyggkrcmEBEpL7TzXZekDNYkirrPj80hXirgw_Y9boKtRjg",
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
    push_to_datastore.serve(name="datapusher")
