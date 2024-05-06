from prefect import task, get_run_logger
from helpers import get_url, check_response
import requests
import json

@task(retries=3, retry_delay_seconds=15)
def send_callback(api_key: str, ckan_url: str, endpoint: str, data: dict):
    logger = get_run_logger()
    url = get_url(endpoint, ckan_url)

    logger.info(url)

    r = requests.post(
        url,
        verify=True,
        data=json.dumps(data),
        headers={"Content-Type": "application/json", "Authorization": api_key},
    )
    check_response(r, url, "CKAN")

    return r.json()["result"]
