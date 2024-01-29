from dateutil.parser import parse as parsedate
from requests.models import HTTPError
import requests
import time
import mimetypes
import pytz
import hashlib
import os
from prefect import task
from models import GetResource, Resource
from datasize import DataSize

@task()
def download_resource(resource: Resource, get_resource: GetResource, temp_dir):
    timer_start = time.perf_counter()

    # fetch the resource data
    print(f"Fetching from: {resource.url}...")
    headers = {}
    if resource.url_type == "upload":
        # If this is an uploaded file to CKAN, authenticate the request,
        # otherwise we won't get file from private resources
        headers["Authorization"] = get_resource.api_key
    try:
        kwargs = {
            "headers": headers,
            "timeout": 30,
            "verify": False,
            "stream": True,
        }
        with requests.get(resource.url, **kwargs) as response:
            response.raise_for_status()

            cl = response.headers.get("content-length")
            max_content_length = 535600000
            ct = response.headers.get("content-type")

            resource_format = resource.format.upper()

            # if format was not specified, try to get it from mime type
            if not resource_format:
                print("File format: NOT SPECIFIED")
                # if we have a mime type, get the file extension from the response header
                if ct:
                    resource_format = mimetypes.guess_extension(ct.split(";")[0])

                    if resource_format is None:
                        raise Exception(
                            "Cannot determine format from mime type. Please specify format."
                        )
                    print(f"Inferred file format: {resource_format}")
                else:
                    raise Exception(
                        "Server did not return content-type. Please specify format."
                    )
            else:
                print(f"File format: {resource_format}")

            tmp = os.path.join(temp_dir, "tmp." + resource_format)
            length = 0
            m = hashlib.md5()

            # download the file
            if cl:
                print("Downloading {:.2MB} file...".format(DataSize(int(cl))))
            else:
                print("Downloading file of unknown size...")

            with open(tmp, "wb") as tmp_file:
                for chunk in response.iter_content(16384):
                    length += len(chunk)
                    if length > max_content_length:
                        raise Exception(
                            "Resource too large to process: {cl} > max ({max_cl}).".format(
                                cl=length, max_cl=max_content_length
                            )
                        )
                    tmp_file.write(chunk)
                    m.update(chunk)

    except requests.HTTPError as e:
        raise HTTPError(
            "DataPusher+ received a bad HTTP response when trying to download "
            "the data file",
            status_code=e.response.status_code,
            request_url=resource.url,
            response=e.response.content,
        )
    except requests.RequestException as e:
        raise HTTPError(
            message=str(e), status_code=None, request_url=resource.url, response=None
        )

    file_hash = m.hexdigest()

    # check if the resource metadata (like data dictionary data types)
    # has been updated since the last fetch
    resource_updated = False
    resource_last_modified = resource.last_modified
    if resource_last_modified:
        resource_last_modified = parsedate(resource_last_modified)
        file_last_modified = response.headers.get("last-modified")
        if file_last_modified:
            file_last_modified = parsedate(file_last_modified)
            if file_last_modified.tzinfo is None:
                file_last_modified = file_last_modified.replace(tzinfo=pytz.UTC)
            if resource_last_modified.tzinfo is None:
                resource_last_modified = resource_last_modified.replace(tzinfo=pytz.UTC)
            if file_last_modified < resource_last_modified:
                resource_updated = True

    fetch_elapsed = time.perf_counter() - timer_start
    print(
        "Fetched {:.2MB} file in {:,.2f} seconds.".format(
            DataSize(length), fetch_elapsed
        )
    )
    if resource.hash == file_hash and not resource_updated:
        print(
            "Upload skipped as the file hash hasn't changed: {hash}.".format(
                hash=file_hash
            )
        )
        return resource, tmp, fetch_elapsed

    return resource.model_copy(update={"hash": file_hash}), tmp, fetch_elapsed



