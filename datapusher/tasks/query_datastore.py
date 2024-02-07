from prefect import task, get_run_logger
from helpers import get_url, check_response
import requests


@task(retries=3, retry_delay_seconds=15)
def query_datastore(api_key: str, ckan_url: str, sql: str, provider: str, rw_id: str = ""):
    logger = get_run_logger()

    if provider == "datastore":
        url = get_url("datastore_search_sql", ckan_url)
    elif provider == "rw":
        url = "https://api.resourcewatch.org/v1/query/{}".format(rw_id)

    if ";" in sql:
        sql = sql.split(";")[0]

    if "LIMIT" in sql.upper():
        sql = sql.split("LIMIT")[0]

    fetch_next_page = True
    current_page = 0
    results = []
    limit = 30000

    headers = {}

    if provider == "datastore":
        headers = {"Authorization": api_key}

    while fetch_next_page:
        limited_sql = sql + " LIMIT {} OFFSET {}".format(limit,
                                                         current_page * limit)
        page_url = url + "?sql={}".format(limited_sql)

        logger.info(page_url)

        r = requests.post(
            page_url,
            verify=True,
            headers=headers
        )

        check_response(r, url, "CKAN")

        new_results = r.json()["result" if provider == "datastore" else "data"]

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
