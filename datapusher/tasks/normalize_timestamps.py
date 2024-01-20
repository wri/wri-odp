import os
import subprocess

from prefect import get_run_logger, task

@task(retries=3, retry_delay_seconds=15)
def normalize_timestamps(tmp, qsv_bin, temp_dir, datetimecols_list, prefer_dmy = True):
    logger = get_run_logger()
     # ---------------- Normalize dates to RFC3339 format --------------------
    # if there are any datetime fields, normalize them to RFC3339 format
    # so we can readily insert them as timestamps into postgresql with COPY
    if datetimecols_list:
        qsv_applydp_csv = os.path.join(temp_dir, 'qsv_applydp.csv')
        datecols = ",".join(datetimecols_list)

        qsv_applydp_cmd = [
            qsv_bin,
            "applydp",
            "datefmt",
            datecols,
            tmp,
            "--output",
            qsv_applydp_csv,
        ]
        if prefer_dmy:
            qsv_applydp_cmd.append("--prefer-dmy")
        logger.info(
            'Formatting dates "{}" to ISO 8601/RFC 3339 format with PREFER_DMY: {}...'.format(
                datecols, prefer_dmy
            )
        )
        try:
            subprocess.run(qsv_applydp_cmd, check=True)
        except subprocess.CalledProcessError as e:
            raise Exception("Applydp error: {}".format(e))
        tmp = qsv_applydp_csv
    return tmp
