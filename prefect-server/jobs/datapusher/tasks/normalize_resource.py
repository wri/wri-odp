import subprocess
import tempfile
import os
from prefect import task, get_run_logger
from models import Resource

@task()
def normalize_resource(resource: Resource, temp_dir, qsv_bin, file_bin, tmp):
    logger = get_run_logger()
    # ===================================================================================
    # ANALYZE WITH QSV
    # ===================================================================================
    # Start Analysis using qsv instead of messytables, as
    # 1) its type inferences are bullet-proof not guesses as it scans the entire file,
    # 2) its super-fast, and
    # 3) it has addl data-wrangling capabilities we use in DP+ (e.g. stats, dedup, etc.)

    # ----------------- is it a spreadsheet? ---------------
    # check content type or file extension if its a spreadsheet
    spreadsheet_extensions = ["XLS", "XLSX", "ODS", "XLSM", "XLSB"]
    if resource.format in spreadsheet_extensions:
        # if so, export spreadsheet as a CSV file
        default_excel_sheet = 0
        print(
            "Converting {} sheet {} to CSV...".format(
                resource.format, default_excel_sheet
            )
        )
        # first, we need a temporary spreadsheet filename with the right file extension
        # we only need the filename though, that's why we remove it
        # and create a hardlink to the file we got from CKAN
        qsv_spreadsheet = os.path.join(temp_dir, "qsv_spreadsheet." + resource.format)
        os.link(tmp, qsv_spreadsheet)

        # run `qsv excel` and export it to a CSV
        # use --trim option to trim column names and the data
        qsv_excel_csv = os.path.join(temp_dir, "qsv_excel.csv")
        try:
            qsv_excel = subprocess.run(
                [
                    qsv_bin,
                    "excel",
                    qsv_spreadsheet,
                    "--sheet",
                    str(default_excel_sheet),
                    "--trim",
                    "--output",
                    qsv_excel_csv,
                ],
                check=True,
                capture_output=True,
                text=True,
            )
        except subprocess.CalledProcessError as e:
            print("Upload aborted. Cannot export spreadsheet(?) to CSV: {}".format(e))

            # it had a spreadsheet extension but `qsv excel` failed,
            # get some file info and log it by running `file`
            # just in case the file is not actually a spreadsheet or is encrypted
            # so the user has some actionable info
            file_format = subprocess.run(
                [file_bin, qsv_spreadsheet],
                check=True,
                capture_output=True,
                text=True,
            )

            print(
                "Is the file encrypted or is not a spreadsheet?\nFILE ATTRIBUTES: {}".format(
                    file_format.stdout
                )
            )

            return
        excel_export_msg = qsv_excel.stderr
        print("{}...".format(excel_export_msg))
        tmp = qsv_excel_csv
    else:
        # -------------- its not a spreadsheet, its a CSV/TSV/TAB file ---------------
        # Normalize & transcode to UTF-8 using `qsv input`. We need to normalize as
        # it could be a CSV/TSV/TAB dialect with differing delimiters, quoting, etc.
        # Using qsv input's --output option also auto-transcodes to UTF-8.
        # Note that we only change the workfile, the resource file itself is unchanged.

        # ------------------- Normalize to CSV ---------------------
        qsv_input_csv = os.path.join(temp_dir, "qsv_input.csv")
        # if resource_format is CSV we don't need to normalize
        if resource.format == "CSV":
            print("Normalizing/UTF-8 transcoding {}...".format(resource.format))
        else:
            # if not CSV (e.g. TSV, TAB, etc.) we need to normalize to CSV
            print("Normalizing/UTF-8 transcoding {} to CSV...".format(resource.format))

        qsv_input_utf_8_encoded_csv = tempfile.NamedTemporaryFile(suffix=".csv")
        # using uchardet to determine encoding
        file_encoding = subprocess.run(
            ["uchardet", tmp],
            check=True,
            capture_output=True,
            text=True,
        )
        print("Identified encoding of the file: {}".format(file_encoding.stdout))

        # using iconv to re-encode in UTF-8
        if file_encoding.stdout != "UTF-8":
            print(
                "File is not UTF-8 encoded. Re-encoding from {} to UTF-8".format(
                    file_encoding.stdout
                )
            )
            try:
                subprocess.run(
                    [
                        "iconv",
                        "-f",
                        file_encoding.stdout,
                        "-t",
                        "UTF-8",
                        tmp,
                        "--output",
                        qsv_input_utf_8_encoded_csv.name,
                    ],
                    check=True,
                )
            except subprocess.CalledProcessError as e:
                # return as we can't push a non UTF-8 CSV
                print(
                    "Job aborted as the file cannot be re-encoded to UTF-8: {}.".format(
                        e
                    )
                )
                return
        try:
            subprocess.run(
                [
                    qsv_bin,
                    "input",
                    qsv_input_utf_8_encoded_csv.name,
                    "--trim-headers",
                    "--output",
                    qsv_input_csv,
                ],
                check=True,
            )
        except subprocess.CalledProcessError as e:
            # return as we can't push an invalid CSV file
            logger.error(
                "Job aborted as the file cannot be normalized/transcoded: {}.".format(e)
            )
            return
        tmp = qsv_input_csv
        logger.info("Normalized & transcoded...")
        return tmp



