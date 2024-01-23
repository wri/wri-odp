# encoding: utf-8
from __future__ import annotations

from ckan.types import Context
import logging
import json
import datetime
import time
from typing import Any

from urllib.parse import urljoin
from dateutil.parser import parse as parse_date

import requests

import ckan.lib.helpers as h
import ckan.lib.navl.dictization_functions
import ckan.logic as logic
import ckan.plugins as p
from ckan.common import config
import ckanext.datapusher.logic.schema as dpschema
import ckanext.datapusher.interfaces as interfaces

log = logging.getLogger(__name__)
_get_or_bust = logic.get_or_bust
_validate = ckan.lib.navl.dictization_functions.validate


def datapusher_submit(context: Context, data_dict: dict[str, Any]):
    """Submit a job to the datapusher. The datapusher is a service that
    imports tabular data into the datastore.

    :param resource_id: The resource id of the resource that the data
        should be imported in. The resource's URL will be used to get the data.
    :type resource_id: string
    :param force: Set to ``True`` to force the datapusher to reload the file
    :type force: bool
    :param set_url_type: If set to True, the ``url_type`` of the resource will
        be set to ``datastore`` and the resource URL will automatically point
        to the :ref:`datastore dump <dump>` URL. (optional, default: False)
    :type set_url_type: bool
    :param ignore_hash: If set to True, the datapusher will reload the file
        even if it haven't changed. (optional, default: False)
    :type ignore_hash: bool

    Returns ``True`` if the job has been submitted and ``False`` if the job
    has not been submitted, i.e. when the datapusher is not configured.

    :rtype: bool
    """
    schema = context.get("schema", dpschema.datapusher_submit_schema())
    data_dict, errors = _validate(data_dict, schema, context)
    if errors:
        raise p.toolkit.ValidationError(errors)

    res_id = data_dict["resource_id"]

    force = False
    if data_dict.get("__extras"):
        force = data_dict["__extras"].get("force", False)

    p.toolkit.check_access("datapusher_submit", context, data_dict)

    try:
        resource_dict = p.toolkit.get_action("resource_show")(
            context,
            {
                "id": res_id,
            },
        )
    except logic.NotFound:
        return False

    prefect_url: str = config.get("ckanext.wri.prefect_url")

    callback_url_base = config.get("ckan.datapusher.callback_url_base") or config.get(
        "ckan.site_url"
    )
    if callback_url_base:
        site_url = callback_url_base
        callback_url = urljoin(
            callback_url_base.rstrip("/"), "/api/3/action/datapusher_hook"
        )
    else:
        site_url = h.url_for("home.index", qualified=True)
        callback_url = h.url_for("/api/3/action/datapusher_hook", qualified=True)

    for plugin in p.PluginImplementations(interfaces.IDataPusher):
        upload = plugin.can_upload(res_id)
        if not upload:
            msg = "Plugin {0} rejected resource {1}".format(
                plugin.__class__.__name__, res_id
            )
            log.info(msg)
            return False

    task = {
        "entity_id": res_id,
        "entity_type": "resource",
        "task_type": "datapusher",
        "last_updated": str(datetime.datetime.utcnow()),
        "state": "submitting",
        "key": "datapusher",
        "value": "{}",
        "error": "{}",
    }

    try:
        existing_task = p.toolkit.get_action("task_status_show")(
            context,
            {"entity_id": res_id, "task_type": "datapusher", "key": "datapusher"},
        )
        assume_task_stale_after = datetime.timedelta(
            seconds=config.get("ckan.datapusher.assume_task_stale_after")
        )
        if existing_task.get("state") == "pending":
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
                if force:
                    log.info("Force flag set, so we will continue")
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
    # Use local session for task_status_update, so it can commit its own
    # results without messing up with the parent session that contains pending
    # updats of dataset/resource/etc.
    context.update(
        {"session": context["model"].meta.create_local_session()}  # type: ignore
    )
    p.toolkit.get_action("task_status_update")(context, task)

    timeout = config.get("ckan.requests.timeout")

    # This setting is checked on startup
    api_token = p.toolkit.config.get("ckan.datapusher.api_token")
    # Datapusher hack
    api_token = p.toolkit.get_action('api_token_create')(context, data_dict).get('token') if force else api_token
    try:
        deployment = requests.get(
            urljoin(prefect_url, "api/deployments/name/push-to-datastore/datapusher")
        )
        deployment = deployment.json()
        deployment_id = deployment["id"]
        print("API TOKEN", api_token)
        r = requests.post(
            urljoin(prefect_url, f"api/deployments/{deployment_id}/create_flow_run"),
            headers={"Content-Type": "application/json"},
            timeout=timeout,
            data=json.dumps(
                {
                    "parameters": {
                        "api_key": api_token,
                        "resource_id": res_id,
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
        raise p.toolkit.ValidationError(error)

    value = json.dumps({"job_id": r.json()["id"]})

    task["value"] = value
    task["state"] = "pending"
    task["last_updated"] = (str(datetime.datetime.utcnow()),)
    p.toolkit.get_action("task_status_update")(context, task)

    return True


@logic.side_effect_free
def datapusher_latest_task(
    context: Context, data_dict: dict[str, Any]
) -> dict[str, Any]:
    """Get the latest task of datapusher job for a certain resource.

    With the job id in hand we can ask Prefect to get the status and logs of the job

    :param resource_id: The resource id of the resource that you want the
        datapusher status for.
    :type resource_id: string
    """

    p.toolkit.check_access("datapusher_status", context, data_dict)

    if "id" in data_dict:
        data_dict["resource_id"] = data_dict["id"]
    res_id = _get_or_bust(data_dict, "resource_id")

    task = p.toolkit.get_action("task_status_show")(
        context, {"entity_id": res_id, "task_type": "datapusher", "key": "datapusher"}
    )

    return task
