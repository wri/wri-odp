from typing import Optional
from urllib.parse import urlsplit, urlunsplit
from prefect import task, get_run_logger
from helpers import get_url, check_response
import requests
import re


# NOTE: this only works for CartoDB layers
@task(retries=3, retry_delay_seconds=15)
def query_datastore(
    api_key: str,
    ckan_url: str,
    sql: str,
    provider: str,
    rw_id: str = "",
    carto_account: str = "",
    format: str = "",
):
    logger = get_run_logger()

    print("SQL", sql)
    if provider == "datastore":
        url = get_url("datastore_search_sql", ckan_url)
    elif provider == "rw":
        url = "https://{}.carto.com/api/v1/sql".format(carto_account)

    if ";" in sql:
        sql = sql.split(";")[0]

    if "LIMIT" in sql.upper():
        sql = sql.split("LIMIT")[0]

    if format in ["GeoJSON", "SHP", "KML"]:
        pattern = re.compile("SELECT ", re.IGNORECASE)
        sql = pattern.sub("SELECT ST_ASGEOJSON(the_geom) as geometry, ", sql)
        logger.info(sql)

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
        limited_sql = sql + " LIMIT {} OFFSET {}".format(limit, current_page * limit)
        if provider == "datastore":
            page_url = url + "?sql={}".format(limited_sql)
        else:
            page_url = url + "?q={}".format(limited_sql)

        logger.info(page_url)

        r = requests.post(page_url, verify=True, headers=headers)

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
    new_url_parts = (url_parts.scheme, url_parts.netloc, "", "", "")
    # Join the components to form the new URL
    url = urlunsplit(new_url_parts)
    return url + "/api/v1/sql?q="


def build_feature_service(id: str):
    return "https://api.resourcewatch.org/v1/query/{}/".format(id) + "?sql="


def build_gfw(connector_url: str):
    return connector_url + "/query/json?sql="


def build_url(id: str, connector_url: str, provider: str, ckan_url: Optional[str] = ''):
    match provider:
        case "cartodb":
            return build_carto_url(connector_url)
        case "featureservice":
            return build_feature_service(id)
        case "gfw":
            return build_gfw(connector_url)
        case "datastore":
            return get_url("datastore_search_sql", ckan_url) + "?sql="


def get_values(provider: str, data: dict):
    match provider:
        case "cartodb":
            return data["rows"]
        case "gfw":
            return data["data"]
        case "featureservice":
            return data["data"]
        case "datastore":
            return data["result"].get("records", [])


@task(retries=3, retry_delay_seconds=15)
def request_data(input: dict):
    url = input["url"]
    provider = input["provider"]
    sql = input["sql"]
    offset = input["offset"]
    logger = get_run_logger()
    limit = 200
    limited_sql = sql + " LIMIT {} OFFSET {}".format(limit, offset)
    page_url = url + limited_sql
    logger.info(page_url)
    r = requests.get(page_url, verify=True, headers={})
    check_response(r, url, "CKAN")
    new_results = get_values(provider, r.json())
    return new_results


def query_rw(id: str, sql: str, connector_url: str, provider: str, num_of_rows: int):
    limit = 1000
    url = build_url(id, connector_url, provider)
    offsets = [i * limit for i in range(num_of_rows // limit + 1)]
    possible_inputs = [
        {"url": url, "sql": sql, "provider": provider, "offset": offset}
        for offset in offsets
    ]
    results = request_data.map(possible_inputs)
    return results

def query_subset_datastore(id: str, sql: str, num_of_rows: int, ckan_url: str):
    limit = 9999
    url = build_url(id, 'irrelevant', 'datastore', ckan_url)
    offsets = [i * limit for i in range(num_of_rows // limit + 1)]
    possible_inputs = [
        {"url": url, "sql": sql, "provider": 'datastore', "offset": offset}
        for offset in offsets
    ]
    results = request_data.map(possible_inputs)
    return results
