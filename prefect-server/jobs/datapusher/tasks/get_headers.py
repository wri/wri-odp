from prefect import get_run_logger
from config import config
import subprocess
import  os
import json


def get_headers(tmp, temp_dir, qsv_bin):
    logger = get_run_logger()
     # ----------------------- Headers & Safenames ---------------------------
    # get existing header names, so we can use them for data dictionary labels
    # should we need to change the column name to make it "db-safe"
    try:
        qsv_headers = subprocess.run(
            [qsv_bin, "headers", "--just-names", tmp],
            capture_output=True,
            check=True,
            text=True,
        )
    except subprocess.CalledProcessError as e:
        raise Exception("Cannot scan CSV headers: {}".format(e))
    original_headers = str(qsv_headers.stdout).strip()
    original_header_dict = {
        idx: ele for idx, ele in enumerate(original_headers.splitlines())
    }

    # now, ensure our column/header names identifiers are "safe names"
    # i.e. valid postgres/CKAN Datastore identifiers
    unsafe_prefix = config.get("UNSAFE_PREFIX", "unsafe_")
    reserved_colnames = config.get("RESERVED_COLNAMES", "_id")
    qsv_safenames_csv = os.path.join(temp_dir, 'qsv_safenames.csv')
    logger.info('Checking for "database-safe" header names...')
    try:
        qsv_safenames = subprocess.run(
            [
                qsv_bin,
                "safenames",
                tmp,
                "--mode",
                "json",
                "--prefix",
                unsafe_prefix,
                "--reserved",
                reserved_colnames,
            ],
            capture_output=True,
            text=True,
        )
    except subprocess.CalledProcessError as e:
        raise Exception("Safenames error: {}".format(e))

    unsafe_json = json.loads(str(qsv_safenames.stdout))
    unsafe_headers = unsafe_json["unsafe_headers"]

    if unsafe_headers:
        logger.info(
            '"{} unsafe" header names found ({}). Sanitizing..."'.format(
                len(unsafe_headers), unsafe_headers
            )
        )
        qsv_safenames = subprocess.run(
            [
                qsv_bin,
                "safenames",
                tmp,
                "--mode",
                "conditional",
                "--prefix",
                unsafe_prefix,
                "--reserved",
                reserved_colnames,
                "--output",
                qsv_safenames_csv,
            ],
            capture_output=True,
            text=True,
        )
        tmp = qsv_safenames_csv
    else:
        logger.info("No unsafe header names found...")

    return tmp, qsv_headers, original_header_dict
