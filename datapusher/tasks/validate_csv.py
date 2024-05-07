from pathlib import Path
import subprocess
from prefect import task, get_run_logger

@task(retries=3, retry_delay_seconds=15)
def validate_csv(tmp, qsv_bin):
    # ------------------------------------- Validate CSV --------------------------------------
    # Run an RFC4180 check with `qsv validate` against the normalized, UTF-8 encoded CSV file.
    # Even excel exported CSVs can be potentially invalid, as it allows the export of "flexible"
    # CSVs - i.e. rows may have different column counts.
    # If it passes validation, we can handle it with confidence downstream as a "normalized" CSV.
    logger = get_run_logger()
    logger.info("Validating CSV...")
    try:
        subprocess.run(
            [qsv_bin, "validate", tmp], check=True, capture_output=True, text=True
        )
    except subprocess.CalledProcessError as e:
        # return as we can't push an invalid CSV file
        validate_error_msg = e.stderr
        logger.error("Invalid CSV! Job aborted: {}.".format(validate_error_msg))
        return
    logger.info("Well-formed, valid CSV file confirmed...")
    return tmp



