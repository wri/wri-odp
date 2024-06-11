import os
import boto3
import zipfile
from config import config
import shutil
import random
import string
import time
from tqdm import tqdm

from prefect.futures import resolve_futures_to_data

from prefect import task, get_run_logger, variables

s3_config = config.get("S3_CONFIG")


# Function to download an object from S3
def download_from_s3(bucket_name, key, temp_dir):
    # remove first path from key pathname
    local_path = os.path.join(temp_dir, os.path.basename(key))
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
    return local_path

def download_from_url(url, temp_dir):
    local_filename = url.split('/')[-1]
    local_path = os.path.join(temp_dir, os.path.basename(local_filename))
    start_time = time.time()
    import requests
    if "data-api" in url:
        GFW_API_KEY = variables.get("gfw_api_key")
        url = url + f"&x-api-key={GFW_API_KEY}"
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        total_size = int(r.headers.get('content-length', 0))
        print("Downloading", local_filename, "with size", total_size, "bytes", "From", url)
        file_size = 0
        with open(local_path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192): 
                # If you have chunk encoded response uncomment if
                # and set chunk_size parameter to None.
                #if chunk: 
                if chunk:
                   f.write(chunk)
    print("--- %s seconds ---" % (time.time() - start_time))
    print("Downloaded file to", local_path)
    return local_path

# Function to zip files
def zip_files(files, zip_file_name):
    with zipfile.ZipFile(zip_file_name, "w") as zipf:
        for file in files:
            zipf.write(file, os.path.basename(file))

@task(retries=3, retry_delay_seconds=15)
def request_data(input: dict):
    key = input["key"]
    temp_dir = input["temp_dir"]
    if key.startswith("http"):
        return download_from_url(key, temp_dir)
    else:
        return download_from_s3(s3_config.get('S3_BUCKET_NAME'), key, temp_dir)

def download_keys(keys: list[str], filename: str, temp_dir):
    logger = get_run_logger()
    downloaded_files = []
    logger.info("Zipping data...")
    possible_inputs = [
        {"key": key, "temp_dir": temp_dir}
        for key in keys
    ]
    results = request_data.map(possible_inputs)
    return resolve_futures_to_data(results)
