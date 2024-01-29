import subprocess
import json
import os
from prefect import task, get_run_logger

@task(retries=3, retry_delay_seconds=15)
def sort_and_dedup(tmp, qsv_bin, temp_dir):
    # --------------------- Sortcheck --------------------------
    # if SORT_AND_DUPE_CHECK is True or DEDUP is True
    # check if the file is sorted and if it has duplicates
    # get the record count, unsorted breaks and duplicate count as well
    logger = get_run_logger()
    # sort_and_dupe_check = config.get("SORT_AND_DUPE_CHECK")
    # dedup = config.get("DEDUP")

    logger.info("Checking for duplicates and if the CSV is sorted...")
    try:
        qsv_sortcheck = subprocess.run(
            [qsv_bin, "sortcheck", tmp, "--json"],
            capture_output=True,
            text=True,
        )
    except subprocess.CalledProcessError as e:
        raise Exception("Sortcheck error: {}".format(e))
    sortcheck_json = json.loads(str(qsv_sortcheck.stdout))
    is_sorted = sortcheck_json["sorted"]
    record_count = int(sortcheck_json["record_count"])
    unsorted_breaks = int(sortcheck_json["unsorted_breaks"])
    dupe_count = int(sortcheck_json["dupe_count"])
    sortcheck_msg = "Sorted: {}; Unsorted breaks: {:,}".format(
        is_sorted, unsorted_breaks
    )
    # dupe count is only relevant if the file is sorted
    if is_sorted and dupe_count > 0:
        sortcheck_msg = sortcheck_msg + " Duplicates: {:,}".format(dupe_count)
    logger.info(sortcheck_msg)

    # --------------- Do we need to dedup? ------------------
    # note that deduping also ends up creating a sorted CSV
    if dupe_count > 0:
        qsv_dedup_csv = os.path.join(temp_dir, "qsv_dedup.csv")
        logger.info("{:.} duplicate rows found. Deduping...".format(dupe_count))
        qsv_dedup_cmd = [qsv_bin, "dedup", tmp, "--output", qsv_dedup_csv]

        # if the file is already sorted,
        # we can save a lot of time by passing the --sorted flag
        # we also get to "stream" the file and not load it into memory,
        # as we don't need to sort it first
        if is_sorted:
            qsv_dedup_cmd.append("--sorted")
        try:
            qsv_dedup = subprocess.run(
                qsv_dedup_cmd,
                capture_output=True,
                text=True,
            )
        except subprocess.CalledProcessError as e:
            raise Exception("Check for duplicates error: {}".format(e))
        dupe_count = int(str(qsv_dedup.stderr).strip())
        if dupe_count > 0:
            tmp = qsv_dedup_csv
            logger.warning(
                "{:,} duplicates found and removed. Note that deduping results in a sorted CSV.".format(
                    dupe_count
                )
            )

    print(f"Record count: {record_count}")
    return tmp, record_count



