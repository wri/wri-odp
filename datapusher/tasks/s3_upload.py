from prefect import task, get_run_logger
from config import config
import boto3


@task(retries=3, retry_delay_seconds=15)
def s3_upload(filepath: str, object_name: str):
    logger = get_run_logger()
    s3_config = config.get("S3_CONFIG")

    s3_client = boto3.client(
            's3',
            endpoint_url="http://minio:9000" if s3_config.get("S3_ACCESS_KEY_ID") == "minioadmin" else None,
            aws_access_key_id=s3_config.get("S3_ACCESS_KEY_ID"),
            aws_secret_access_key=s3_config.get("S3_SECRET_KEY_ID"),
            region_name=s3_config.get("S3_BUCKET_REGION"),
            )

    s3_client.upload_file(
            filepath,
            s3_config.get("S3_BUCKET_NAME"),
            object_name,
            # TODO: should this be public? Resoning: we don't know when the user is going
            # to access the email
            # ExtraArgs={'ACL': 'public-read'}
            )

    url = s3_client.generate_presigned_url(
            'get_object',
            ExpiresIn=60 * 60 * 24 * 5, 
            Params={
                'Bucket': s3_config.get("S3_BUCKET_NAME"),
                'Key': object_name}
            )

    logger.info(url)

    return url 

