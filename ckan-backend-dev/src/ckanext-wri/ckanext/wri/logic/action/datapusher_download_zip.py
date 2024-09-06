from ckan.types import Context, Any
import ckan.lib.helpers as h
import ckan.plugins as p
from ckan.common import config
import ckan.logic as logic
import ckanext.s3filestore.uploader as uploader
from ckan.lib.mailer import mail_recipient
from ckan.common import config

import datetime
import requests
from urllib.parse import urljoin
import json
import hashlib

import logging

log = logging.getLogger(__name__)


def calculate_md5(input_string):
    md5_hash = hashlib.md5()
    md5_hash.update(input_string.encode("utf-8"))
    return md5_hash.hexdigest()


def check_for_existing_file_in_s3(filename: str, download_filename: str):
    s3 = uploader.BaseS3Uploader()
    cached_file_url = None
    try:
        cached_file_url = s3.get_signed_url_to_key(
            "_downloads_cache/" + filename,
            extra_params={
                "ResponseContentDisposition": 'attachment; filename="{}"'.format(
                    download_filename
                )
            },
        )
    except Exception as e:
        log.error(e)
    return cached_file_url


def build_filename(dataset_id: str, keys: list[str]) -> str:
    sorted_keys = sorted(keys)
    name = f"{dataset_id}-{','.join(sorted_keys)}"
    return calculate_md5(name)


def build_download_filename(dataset_id: str, context) -> str:
    try:
        dataset_dict = p.toolkit.get_action("package_show")(
            context,
            {
                "id": dataset_id,
            },
        )
        download_filename = (
            dataset_dict.get("title")
            or dataset_dict.get("name")
            or dataset_dict.get("id")
            or "file"
        )
        return download_filename
    except logic.NotFound:
        return False


def zipped_download_request(context: Context, data_dict: dict[str, Any]):
    prefect_url: str = config.get("ckanext.wri.prefect_url")
    deployment_name: str = config.get("ckanext.wri.datapusher_deployment_name")

    dataset_id = data_dict.get("dataset_id")
    keys = data_dict.get("keys")
    email = data_dict.get("email")

    if None in (dataset_id, keys, email):
        raise p.toolkit.ValidationError({"message": "Missing parameters"})

    filename = build_filename(dataset_id, keys)
    download_filename = build_download_filename(dataset_id, context)

    cached_file_url = check_for_existing_file_in_s3(f"{filename}.zip", download_filename)
    if cached_file_url:
        send_email([email], cached_file_url, download_filename)
        return True

    task = {
        "entity_id": dataset_id,
        "entity_type": "dataset",
        "task_type": "download_zipped",
        "last_updated": str(datetime.datetime.utcnow()),
        "state": "submitting",
        "key": filename,
        "value": "{}",
        "error": "{}",
    }

    if email:
        task["value"] = json.dumps({"emails": [email]})

    try:
        existing_task = p.toolkit.get_action("task_status_show")(
            context,
            {
                "entity_id": dataset_id,
                "entity_type": "dataset",
                "task_type": "download_zipped",
                "key": filename,
            },
        )
        stale_time = 30
        assume_task_stale_after = datetime.timedelta(seconds=stale_time)
        if existing_task.get("state") == "pending":
            existing_task_values = json.loads(existing_task.get("value"))

            if existing_task_values:
                existing_task_emails = existing_task_values.get("emails")

                update_emails = False

                if existing_task_emails:
                    if email not in existing_task_emails:
                        existing_task_emails.append(email)
                        update_emails = True
                else:
                    existing_task_emails = [email]
                    update_emails = True

                if update_emails:
                    existing_task_values["emails"] = existing_task_emails
                    existing_task["value"] = json.dumps(existing_task_values)
                    p.toolkit.get_action("task_status_update")(
                        {"ignore_auth": True}, existing_task
                    )

            updated = datetime.datetime.strptime(
                existing_task["last_updated"], "%Y-%m-%dT%H:%M:%S.%f"
            )
            time_since_last_updated = datetime.datetime.utcnow() - updated
            if time_since_last_updated > assume_task_stale_after:
                # it's been a while since the job was last updated - it's more
                # likely something went wrong with it and the state wasn't
                # updated than its still in progress. Let it be restarted.
                log.info(
                    "A pending task was found %r, but it is only %s hours" " old",
                    existing_task["id"],
                    time_since_last_updated,
                )
            else:
                log.info(
                    "A pending task was found %s for this resource, so "
                    "skipping this duplicate task",
                    existing_task["id"],
                )
                return False
        task["id"] = existing_task["id"]
    except logic.NotFound:
        pass

    context["ignore_auth"] = True
    context.update(
        {"session": context["model"].meta.create_local_session()}  # type: ignore
    )

    # TODO: is that right?
    api_token = p.toolkit.get_action("api_token_create")(
        {"ignore_auth": True}, {"user": "ckan_admin", "name": "datapusher"}
    ).get("token")

    try:
        deployment = requests.get(
            urljoin(
                prefect_url,
                f"api/deployments/name/download-resources-zipped/{deployment_name}",
            )
        )
        deployment = deployment.json()
        deployment_id = deployment["id"]
        r = requests.post(
            urljoin(prefect_url, f"api/deployments/{deployment_id}/create_flow_run"),
            headers={"Content-Type": "application/json"},
            timeout=60,
            data=json.dumps(
                {
                    "parameters": {
                        "api_key": api_token,
                        "task_id": task.get("id"),
                        "dataset_id": dataset_id,
                        "keys": keys,
                        "filename": filename,
                        "download_filename": download_filename,
                    },
                    "state": {"type": "SCHEDULED", "state_details": {}},
                }
            ),
        )
    except requests.exceptions.ConnectionError as e:
        error: dict[str, Any] = {
            "message": "Could not connect to DataPusher.",
            "details": str(e),
        }
        task["error"] = json.dumps(error)
        task["state"] = "error"
        task["last_updated"] = (str(datetime.datetime.utcnow()),)
        p.toolkit.get_action("task_status_update")(context, task)
        send_error([email], "Zipped data")
        raise p.toolkit.ValidationError(error)

    try:
        r.raise_for_status()
    except requests.exceptions.HTTPError as e:
        m = "An Error occurred while sending the job: {0}".format(str(e))

        body = ""
        if e.response is not None:
            try:
                body = e.response.json()
                if body.get("error"):
                    m += " " + body["error"]
            except ValueError:
                body = e.response.text

        error = {"message": m, "details": body, "status_code": r.status_code}
        task["error"] = json.dumps(error)
        task["state"] = "error"
        task["last_updated"] = (str(datetime.datetime.utcnow()),)
        p.toolkit.get_action("task_status_update")(context, task)
        send_error([email], "Zipped data")
        raise p.toolkit.ValidationError(error)

    value = {"job_id": r.json()["id"]}

    if email:
        value["emails"] = [email]

    value["download_filename"] = download_filename

    task["value"] = json.dumps(value)
    task["state"] = "pending"
    task["last_updated"] = (str(datetime.datetime.utcnow()),)
    p.toolkit.get_action("task_status_update")(context, task)

    return True


def zipped_download_callback(context: Context, data_dict: dict[str, Any]):
    entity_id = data_dict.get("entity_id")
    key = data_dict.get("key")
    task = p.toolkit.get_action("task_status_show")(
        context,
        {"entity_id": entity_id, "task_type": "download_zipped", "key": key},
    )

    if not task:
        raise logic.NotFound("Task not found")

    state = data_dict.get("state")
    error = data_dict.get("error")

    task["state"] = state
    task["error"] = json.dumps(error)
    task["last_updated"] = (str(datetime.datetime.utcnow()),)
    p.toolkit.get_action("task_status_update")(context, task)

    value = json.loads(task["value"])
    emails = value.get("emails", [])
    download_filename = value.get("download_filename")

    if state == "complete":
        url = data_dict.get("url")
        send_email(emails, url, download_filename)
    else:
        send_error(emails, download_filename)
        log.error(error)


FILE_EMAIL_HTML = """
<html>
    <body>
        <p>The file you requested is ready. Click the link below to download it:</p>
        <br>
        <a target="_blank" href="{}">{}</a>
        <br>
        <br>
        <br>
        <a target="_blank" href="{}">{}</a>
    </body>
</html>

"""


def send_email(emails: list[str], url: str, download_filename: str):
    odp_url = config.get("ckanext.wri.odp_url")
    for email in emails:
        mail_recipient(
            "",
            email,
            "WRI - Your file is ready ({})".format(download_filename),
            "",
            FILE_EMAIL_HTML.format(url, download_filename, odp_url, odp_url),
        )


ERROR_EMAIL_HTML = """
<html>
    <body>
        <p>An error happened while preparing the file you requested for download. Please, try again.</p>
        <br>
        <a target="_blank" href="{}">{}</a>
    </body>
</html>

"""


def send_error(emails: list[str], resource_title):
    odp_url = config.get("ckanext.wri.odp_url")
    for email in emails:
        mail_recipient(
            "",
            email,
            "WRI - Failed to process file ({})".format(resource_title),
            "",
            ERROR_EMAIL_HTML.format(odp_url, odp_url),
        )
