import os
import boto3
import zipfile
from config import config

from prefect import task, get_run_logger

s3_config = config.get("S3_CONFIG")


# Function to download an object from S3
def download_from_s3(bucket_name, key, local_path):
    # remove first path from key pathname
    _key = key.split("/", 1)[1]
    _key = _key if s3_config.get("S3_ACCESS_KEY_ID") == "minioadmin" else key
    s3 = boto3.client(
        "s3",
        endpoint_url=(
            "http://minio:9000"
            if s3_config.get("S3_ACCESS_KEY_ID") == "minioadmin"
            else None
        ),
        aws_access_key_id=s3_config.get("S3_ACCESS_KEY_ID"),
        aws_secret_access_key=s3_config.get("S3_SECRET_KEY_ID"),
        region_name=s3_config.get("S3_BUCKET_REGION"),
    )
    s3.download_file(bucket_name, _key, local_path)


# Function to zip files
def zip_files(files, zip_file_name):
    with zipfile.ZipFile(zip_file_name, "w") as zipf:
        for file in files:
            zipf.write(file, os.path.basename(file))


@task(retries=3, retry_delay_seconds=15)
def download_keys(keys: list[str], filename: str, temp_dir):
    logger = get_run_logger()
    downloaded_files = []
    logger.info("Zipping data...")
    for key in keys:
        local_path = os.path.join(temp_dir, os.path.basename(key))
        download_from_s3(s3_config.get('S3_BUCKET_NAME'), key, local_path)
        downloaded_files.append(local_path)

    # Zip downloaded files
    zip_file_name = f"{filename}.zip"
    zip_file_name = os.path.join(temp_dir, zip_file_name)
    zip_files(downloaded_files, zip_file_name)
    logger.info("Zipped data to {}".format(zip_file_name))
    return zip_file_name
