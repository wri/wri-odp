from urllib.parse import urlsplit
import requests
import json
import time
from prefect import task
from helpers import check_response, get_url
from models import GetResource
from helpers import get_request_headers

@task()
def get_resource_metadata(get_resource: GetResource):
    """
    Gets available information about the resource from CKAN
    """
    ckan_url = get_resource.ckan_url
    resource_id = get_resource.resource_id
    api_key = get_resource.api_key

    try:
        url = get_url("resource_show", ckan_url)
        r = requests.post(
            url,
            verify=True,
            data=json.dumps({"id": resource_id}),
            headers=get_request_headers(api_key),
        )
        check_response(r, url, "CKAN")
        print(r.json())
        resource = r.json()["result"]
    except Exception:
        # try again in 5 seconds just incase CKAN is slow at adding resource
        time.sleep(5)
        url = get_url("resource_show", ckan_url)
        r = requests.post(
            url,
            verify=True,
            data=json.dumps({"id": resource_id}),
            headers=get_request_headers(api_key),
        )
        check_response(r, url, "CKAN")
        resource = r.json()["result"]

    # check if the resource url_type is a datastore
    if resource.get("url_type") == "datastore":
        print("Dump files are managed with the Datastore API")
        return

    # check scheme
    resource_url = resource.get("url")
    scheme = urlsplit(resource_url).scheme
    if scheme not in ("http", "https", "ftp"):
        raise Exception("Only http, https, and ftp resources may be fetched.")

    return resource




