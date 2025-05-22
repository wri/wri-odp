from ckan.types import Context, Any
import ckan.lib.helpers as h
import ckan.plugins as p
from ckan.common import config
import ckan.logic as logic
import ckanext.s3filestore.uploader as uploader
from ckan.lib.mailer import mail_recipient
from ckan.common import config
from .datapusher_download_zip import fetch_dataset_entity, get_admin_emails_for_dataset, ERROR_EMAIL_HTML_ADMIN

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


def build_filename(sql: str, format: str, id: str, provider: str, context) -> str:
    if provider == "datastore":
        try:
            resource_dict = p.toolkit.get_action("resource_show")(
                context,
                {
                    "id": id,
                },
            )
            res_last_modified = resource_dict.get("metadata_modified")
            filename = (
                id + "-" + calculate_md5(sql) + "_" + res_last_modified + "." + format
            ).lower()
            return filename
        except logic.NotFound:
            return False
    else:
        name = f"{sql}-{id}"
        filename = calculate_md5(name) + f".{format.lower()}"
        return filename


def build_download_filename(
    dataset_id: str, format: str, id: str, provider: str, context
) -> str:
    if provider == "datastore":
        try:
            resource_dict = p.toolkit.get_action("resource_show")(
                context,
                {
                    "id": id,
                },
            )
            download_filename = (
                resource_dict.get("title")
                or resource_dict.get("name")
                or resource_dict.get("id")
                or "file"
            )
            download_filename += ".{}".format(format.lower())
            return download_filename
        except logic.NotFound:
            return False
    else:
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
            download_filename += ".{}".format(format.lower())
            return download_filename
        except logic.NotFound:
            return False


# TODO: rename this file
def subset_download_request(context: Context, data_dict: dict[str, Any]):
    prefect_url: str = config.get("ckanext.wri.prefect_url")
    deployment_name: str = config.get("ckanext.wri.datapusher_deployment_name")

    dataset_id = data_dict.get("dataset_id")
    format = data_dict.get("format")
    id = data_dict.get("id")
    provider = data_dict.get("provider")
    num_of_rows = data_dict.get("numOfRows")
    connector_url = data_dict.get("connectorUrl")
    sql = data_dict.get("sql")
    email = data_dict.get("email")

    if None in (format, id, provider, sql):
        raise p.toolkit.ValidationError({"message": "Missing parameters"})

    filename = build_filename(sql, format, id, provider, context)
    download_filename = build_download_filename(
        dataset_id, format, id, provider, context
    )

    cached_file_url = check_for_existing_file_in_s3(filename, download_filename)
    if cached_file_url:
        send_email([email], cached_file_url, download_filename)
        return True

    task = {
        "entity_id": id if provider == "datastore" else dataset_id,
        "entity_type": "resource" if provider == "datastore" else "dataset",
        "task_type": "download_subset",
        "last_updated": str(datetime.datetime.utcnow()),
        "state": "submitting",
        "key": filename,
        "value": "{}",
        "error": "{}",
    }

    admin_email= get_admin_emails_for_dataset(dataset_id)
    value = {}
    if admin_email:
        value["admin_emails"] = admin_email
    
    if email:
        value["emails"] = [email]

    task["value"] = json.dumps(value)

    try:
        existing_task = p.toolkit.get_action("task_status_show")(
            context,
            {
                "entity_id": id if provider == "datastore" else dataset_id,
                "entity_type": "resource" if provider == "datastore" else "dataset",
                "task_type": "download_subset",
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
                    existing_task_values["admin_emails"] = admin_email
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
                f"api/deployments/name/download-subset-of-data/{deployment_name}",
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
                        "id": id,
                        "task_id": task.get("id"),
                        "provider": provider,
                        "dataset_id": dataset_id,
                        "sql": sql,
                        "num_of_rows": int(num_of_rows),
                        "filename": filename,
                        "format": format,
                        "download_filename": download_filename,
                        "connector_url": connector_url,
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
        dataset_rslt = fetch_dataset_entity({
            "entity_id": id if provider == "datastore" else dataset_id,
            "entity_type": "resource" if provider == "datastore" else "dataset"
        })
        dataset_name = dataset_rslt.get("name")
        dataset_team = dataset_rslt.get("organization", {}).get("title")
        send_error([email], admin_email, "Subset of data",dataset_team, dataset_name)
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
        dataset_rslt = fetch_dataset_entity({
            "entity_id": id if provider == "datastore" else dataset_id,
            "entity_type": "resource" if provider == "datastore" else "dataset"
        })
        dataset_name = dataset_rslt.get("name")
        dataset_team = dataset_rslt.get("organization", {}).get("title")
        send_error([email],admin_email, "Subset of data",dataset_team, dataset_name)
        raise p.toolkit.ValidationError(error)

    value = {"job_id": r.json()["id"]}
    value["admin_emails"] = admin_email
    if email:
        value["emails"] = [email]

    value["download_filename"] = download_filename

    task["value"] = json.dumps(value)
    task["state"] = "pending"
    task["last_updated"] = (str(datetime.datetime.utcnow()),)
    p.toolkit.get_action("task_status_update")(context, task)

    return True


def subset_download_callback(context: Context, data_dict: dict[str, Any]):
    entity_id = data_dict.get("entity_id")
    key = data_dict.get("key")
    task = p.toolkit.get_action("task_status_show")(
        context,
        {"entity_id": entity_id, "task_type": "download_subset", "key": key},
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
    admin_emails = value.get("admin_emails", [])
    download_filename = value.get("download_filename")
    

    if state == "complete":
        url = data_dict.get("url")
        send_email(emails, url, download_filename)
    else:
        dataset_rslt = fetch_dataset_entity({
            "entity_id": entity_id,
            "entity_type": data_dict.get("entity_type", "resource")
        })
        dataset_name = dataset_rslt.get("name")
        dataset_team = dataset_rslt.get("organization", {}).get("title")
        send_error(emails, admin_emails, download_filename,dataset_team, dataset_name)
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
         <p>
         You recently requested the below data from the World Resources Institute Data Explorer. 
         Our systems encountered an error during the packaging of this data and we are unable to deliver your files at this time.
        </p>

        <b>
        {}
        </b>
        </br>
        <b>
        <a target="_blank" href="{}/datasets/{}">Dataset link</a>
        </b>

        <p>
        This may be a temporary issue but more likely represents some misconfiguration in our systems. 
        Please reach out to <a href="mailto:data@wri.org">data@wri.org</a> to request immediate support.
        </p>
        <br>
        <a target="_blank" href="{}">{}</a>
    </body>
</html>

"""




def send_error(emails: list[str], admin_email , resource_title, dataset_team, dataset_name):
    odp_url = config.get("ckanext.wri.odp_url")
    for email in emails:
        mail_recipient(
            "",
            email,
            "WRI - Failed to process file ({})".format(resource_title),
            "",
            ERROR_EMAIL_HTML.format(dataset_name,odp_url,dataset_name,odp_url, odp_url),
        )

    for email in admin_email:
        mail_recipient(
            "",
            email,
            "WRI - Failed to process file ({})".format(resource_title),
            "",
            ERROR_EMAIL_HTML_ADMIN.format(dataset_name,odp_url,dataset_name,dataset_team, odp_url, odp_url),
        )
