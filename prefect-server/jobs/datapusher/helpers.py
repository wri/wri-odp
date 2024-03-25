import requests
import json
import datetime
import decimal
from urllib.parse import urlsplit

from models import Package, Resource

class DatastoreEncoder(json.JSONEncoder):
    # Custom JSON encoder
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        if isinstance(obj, decimal.Decimal):
            return str(obj)

        return json.JSONEncoder.default(self, obj)


def get_request_headers(api_key, content_type="application/json", **kwargs):
    """
    Add header to indicate that the request is coming from the frontend portal

    :param api_key: The API key to use for the request
    :type api_key: string

    :param content_type: The content type of the request
    :type content_type: string

    :param kwargs: Additional headers to include in the request
    :type kwargs: dict

    :return: A dictionary of headers
    :rtype: dict
    """
    return {
        "Content-Type": content_type,
        "Authorization": api_key,
        "X-From-Frontend-Portal": "true",
        **kwargs,
    }


def get_url(action, ckan_url):
    """
    Get url for ckan action
    """
    print("CKAN URL", ckan_url)
    if not urlsplit(ckan_url).scheme:
        ckan_url = "http://" + ckan_url.lstrip("/")  # DevSkim: ignore DS137138
    ckan_url = ckan_url.rstrip("/")
    return "{ckan_url}/api/3/action/{action}".format(ckan_url=ckan_url, action=action)


def check_response(
    response, request_url, who, good_status=(201, 200), ignore_no_success=False
):
    """
    Checks the response and raises exceptions if something went terribly wrong

    :param who: A short name that indicated where the error occurred
                (for example "CKAN")
    :param good_status: Status codes that should not raise an exception

    """
    if not response.status_code:
        raise HTTPError(
            "DataPusher received an HTTP response with no status code",
            status_code=None,
            request_url=request_url,
            response=response.text,
        )

    message = "{who} bad response. Status code: {code} {reason}. At: {url}."
    try:
        if response.status_code not in good_status:
            json_response = response.json()
            if not ignore_no_success or json_response.get("success"):
                try:
                    message = json_response["error"]["message"]
                except Exception:
                    message = message.format(
                        who=who,
                        code=response.status_code,
                        reason=response.reason,
                        url=request_url,
                    )
                raise HTTPError(
                    message,
                    status_code=response.status_code,
                    request_url=request_url,
                    response=response.text,
                )
    except ValueError:
        message = message.format(
            who=who,
            code=response.status_code,
            reason=response.reason,
            url=request_url,
            resp=response.text[:200],
        )
        raise HTTPError(
            message,
            status_code=response.status_code,
            request_url=request_url,
            response=response.text,
        )

class HTTPError(Exception):
    """Exception that's raised if a job fails due to an HTTP problem."""

    def __init__(self, message, status_code, request_url, response):
        """Initialise a new HTTPError.

        :param message: A human-readable error message
        :type message: string

        :param status_code: The status code of the errored HTTP response,
            e.g. 500
        :type status_code: int

        :param request_url: The URL that was requested
        :type request_url: string

        :param response: The body of the errored HTTP response as unicode
            (if you have a requests.Response object then response.text will
            give you this)
        :type response: unicode

        """
        super(HTTPError, self).__init__(message)
        self.status_code = status_code
        self.request_url = request_url
        self.response = response

    def as_dict(self):
        """Return a JSON-serializable dictionary representation of this error.

        Suitable for ckanserviceprovider to return to the client site as the
        value for the "error" key in the job dict.

        """
        if self.response and len(self.response) > 200:
            response = self.response[:200]
        else:
            response = self.response
        return {
            "message": self.message,
            "HTTP status code": self.status_code,
            "Requested URL": self.request_url,
            "Response": response,
        }

    def __str__(self):
        return "{} status={} url={} response={}".format(
            self.message, self.status_code, self.request_url, self.response
        ).encode("ascii", "replace")


def datastore_resource_exists(resource_id, api_key, ckan_url):
    try:
        search_url = get_url("datastore_search", ckan_url)
        response = requests.post(
            search_url,
            verify=False,
            data=json.dumps({"id": resource_id, "limit": 0}),
            headers=get_request_headers(api_key),
        )
        if response.status_code == 404:
            return False
        elif response.status_code == 200:
            return response.json().get("result", {"fields": []})
        else:
            raise HTTPError(
                "Error getting datastore resource.",
                response.status_code,
                search_url,
                response,
            )
    except requests.exceptions.RequestException as e:
        raise Exception("Error getting datastore resource ({!s}).".format(e))


def delete_datastore_resource(resource_id, api_key, ckan_url):
    try:
        delete_url = get_url("datastore_delete", ckan_url)
        response = requests.post(
            delete_url,
            verify=False,
            data=json.dumps({"id": resource_id, "force": True}),
            headers=get_request_headers(api_key),
        )
        check_response(
            response,
            delete_url,
            "CKAN",
            good_status=(201, 200, 404),
            ignore_no_success=True,
        )
    except requests.exceptions.RequestException:
        raise Exception("Deleting existing datastore failed.")

def send_resource_to_datastore(
    resource,
    resource_id,
    headers,
    api_key,
    ckan_url,
    records,
    aliases,
    calculate_record_count,
):
    """
    Stores records in CKAN datastore
    """

    if resource_id:
        # used to create the "main" resource
        request = {
            "resource_id": resource_id,
            "fields": headers,
            "force": True,
            "records": records,
            "aliases": aliases,
            "calculate_record_count": calculate_record_count,
        }
    else:
        # used to create the "stats" resource
        request = {
            "resource": resource,
            "fields": headers,
            "force": True,
            "aliases": aliases,
            "calculate_record_count": calculate_record_count,
        }

    url = get_url("datastore_create", ckan_url)
    r = requests.post(
        url,
        verify=False,
        data=json.dumps(request, cls=DatastoreEncoder),
        headers=get_request_headers(api_key),
    )
    check_response(r, url, "CKAN DataStore")
    return r.json()

def get_package(package_id, ckan_url, api_key) -> Package:
    """
    Gets available information about a package from CKAN
    """
    url = get_url("package_show", ckan_url)
    r = requests.post(
        url,
        verify=True,
        data=json.dumps({"id": package_id}),
        headers=get_request_headers(api_key),
    )
    check_response(r, url, "CKAN")

    return Package(**r.json()["result"])


def update_resource(resource, ckan_url, api_key) -> Resource:
    url = get_url("resource_update", ckan_url)
    r = requests.post(
        url,
        verify=True,
        data=json.dumps(resource),
        headers=get_request_headers(api_key),
    )

    check_response(r, url, "CKAN")
