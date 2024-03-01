from urllib.parse import urlsplit, urlunsplit
from prefect import task, get_run_logger
from helpers import get_url, check_response
import requests


# NOTE: this only works for CartoDB layers
@task(retries=3, retry_delay_seconds=15)
def query_datastore(api_key: str, ckan_url: str, sql: str, provider: str, rw_id: str = ""):
    logger = get_run_logger()

    print("SQL", sql)
    if provider == "datastore":
        url = get_url("datastore_search_sql", ckan_url)
    elif provider == "rw":
        url = "https://wri-rw.carto.com/api/v1/sql"

    if ";" in sql:
        sql = sql.split(";")[0]

    if "LIMIT" in sql.upper():
        sql = sql.split("LIMIT")[0]

    fetch_next_page = True
    current_page = 0
    results = []
    limit = 30000
    if provider == "rw":
        limit = 200

    headers = {}

    if provider == "datastore":
        headers = {"Authorization": api_key}

    while fetch_next_page:
        limited_sql = sql + " LIMIT {} OFFSET {}".format(limit,
                                                         current_page * limit)
        if provider == "datastore":
            page_url = url + "?sql={}".format(limited_sql)
        else:
            page_url = url + "?q={}".format(limited_sql)

        logger.info(page_url)

        r = requests.post(
            page_url,
            verify=True,
            headers=headers
        )

        check_response(r, url, "CKAN")

        new_results = r.json()["result" if provider == "datastore" else "rows"]

        if new_results:
            if provider == "datastore":
                new_records = new_results.get("records", [])
            else:
                new_records = new_results
            if len(new_records):
                results.extend(new_records)
            else:
                fetch_next_page = False
            current_page += 1
        else:
            fetch_next_page = False

    return results

def build_carto_url(connector_url: str):
    # Split the URL into components
    url_parts = urlsplit(connector_url)
    # Create a new tuple without the pathname
    new_url_parts = (url_parts.scheme, url_parts.netloc, '', '', '')
    # Join the components to form the new URL
    url = urlunsplit(new_url_parts)
    return url + "/api/v1/sql?q="

def build_feature_service(id: str):
    return 'https://api.resourcewatch.org/v1/dataset/{}/query'.format(id) + '?sql='

def build_url(id: str, connector_url: str, provider: str):
    match provider:
        case "cartodb":
            return build_carto_url(connector_url)
        case "featureservice":
            return build_feature_service(id)

def get_values(provider: str, data: dict):
    match provider:
        case "cartodb":
            return data["rows"]
        case "featureservice":
            return data["data"]

# NOTE: this only works for CartoDB layers
@task(retries=3, retry_delay_seconds=15)
def query_rw(id: str, sql: str, connector_url: str, provider: str):
    logger = get_run_logger()

    url = build_url(id, connector_url, provider)

    if ";" in sql:
        sql = sql.split(";")[0]

    if "LIMIT" in sql.upper():
        sql = sql.split("LIMIT")[0]

    fetch_next_page = True
    current_page = 0
    results = []
    limit = 200

    while fetch_next_page:
        limited_sql = sql + " LIMIT {} OFFSET {}".format(limit,
                                                         current_page * limit)
        page_url = url + limited_sql

        logger.info(page_url)

        r = requests.get(
            page_url,
            verify=True,
            headers={}
        )

        check_response(r, url, "CKAN")

        new_results = get_values(provider, r.json())

        if new_results:
            new_records = new_results
            if len(new_records):
                results.extend(new_records)
            else:
                fetch_next_page = False
            current_page += 1
        else:
            fetch_next_page = False

    return results
