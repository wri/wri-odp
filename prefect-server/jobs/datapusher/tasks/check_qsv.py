from pathlib import Path
import subprocess
import semver
from prefect import task

MINIMUM_QSV_VERSION = "0.108.0"

@task()
def check_qsv(qsv_bin: str, file_bin: str):
    """Checks if QSV Binary and File bin are installed and the correct version"""
    qsv_path = Path(qsv_bin)
    if not qsv_path.is_file():
        raise Exception("{} not found.".format(qsv_bin))

    file_path = Path(file_bin)
    if not file_path.is_file():
        raise Exception("{} not found.".format(file_bin))

    # make sure qsv binary variant is up-to-date
    try:
        qsv_version = subprocess.run(
            [qsv_bin, "--version"],
            capture_output=True,
            text=True,
        )
    except subprocess.CalledProcessError as e:
        raise Exception("qsv version check error: {}".format(e))
    qsv_version_info = str(qsv_version.stdout)
    qsv_semver = qsv_version_info[
        qsv_version_info.find(" ") : qsv_version_info.find("-")
    ].lstrip()
    try:
        if semver.compare(qsv_semver, MINIMUM_QSV_VERSION) < 0:
            raise Exception(
                "At least qsv version {} required. Found {}. You can get the latest release at https://github.com/jqnatividad/qsv/releases/latest".format(
                    MINIMUM_QSV_VERSION, qsv_version_info
                )
            )
    except ValueError as e:
        raise Exception("Cannot parse qsv version info: {}".format(e))
