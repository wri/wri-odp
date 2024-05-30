"""API functions for updating existing data in CKAN."""

from __future__ import annotations

from typing import Optional, TypedDict
from ckan.types import ActionResult, Context, DataDict
from typing_extensions import TypeAlias
import logging
import ckan.model as model
from ckanext.wri.model.notification import Notification, notification_list_dictize
from ckanext.wri.model.pending_datasets import PendingDatasets
from ckanext.wri.logic.auth import schema
from ckanext.wri.logic.action.rw_helpers import (
    create_dataset_rw,
    create_layer_rw,
    edit_layer_rw,
)
from ckanext.wri.logic.action.send_group_notification import (
    GroupNotificationParams,
    send_group_notification,
)
import ckan.plugins.toolkit as tk
import ckan.logic as logic
from ckan.common import _
import json
import requests

# encoding: utf-8


from ckan.types.logic import ActionResult
import logging
import datetime
import time
import json
from typing import Any, Union, TYPE_CHECKING, cast

import ckan.lib.helpers as h
import ckan.plugins as plugins
import ckan.logic as logic
import ckan.logic.schema as schema_
import ckan.lib.dictization.model_dictize as model_dictize
import ckan.lib.dictization.model_save as model_save
import ckan.lib.navl.dictization_functions as dfunc
import ckan.lib.navl.validators as validators
import ckan.lib.plugins as lib_plugins
import ckan.lib.search as search
import ckan.lib.uploader as uploader
import ckan.lib.datapreview
import ckan.lib.app_globals as app_globals

from ckan.common import _, config
from ckan.types import Context, DataDict, ErrorDict, Schema

_validate = dfunc.validate
_get_action = logic.get_action
_check_access = logic.check_access
NotFound = logic.NotFound
ValidationError = logic.ValidationError
_get_or_bust = logic.get_or_bust

NotificationGetUserViewedActivity: TypeAlias = None
log = logging.getLogger(__name__)


def notification_update(
    context: Context, data_dict: DataDict
) -> NotificationGetUserViewedActivity:
    """Update notification status for a user"""

    tk.check_access("notification_create", context, data_dict)
    sch = context.get("schema") or schema.default_update_notification_schema()
    data, errors = tk.navl_validate(data_dict, sch, context)
    if errors:
        raise tk.ValidationError(errors)

    model = context["model"]
    session = context["session"]
    user_obj = model.User.get(context["user"])

    if not data_dict.get("id"):
        return

    notification_id = data_dict.get("id")
    recipient_id = data_dict.get("recipient_id")
    sender_id = data_dict.get("sender_id")
    activity_type = data_dict.get("activity_type")
    object_type = data_dict.get("object_type")
    object_id = data_dict.get("object_id")
    time_sent = data_dict.get("time_sent")
    is_unread = data_dict.get("is_unread")
    state = data_dict.get("state")

    user_notifications = Notification.update(
        notification_id=notification_id,
        recipient_id=recipient_id,
        sender_id=sender_id,
        activity_type=activity_type,
        object_type=object_type,
        object_id=object_id,
        time_sent=time_sent,
        is_unread=is_unread,
        state=state,
    )

    notification_dicts = notification_list_dictize(user_notifications, context)
    if not notification_dicts:
        raise logic.NotFound(_("Notification not found"))
    return notification_dicts


def notification_bulk_update(
    context: Context, data_dict: DataDict
) -> NotificationGetUserViewedActivity:
    """Bulk Update notification status for a user"""

    tk.check_access("notification_create", context, data_dict)
    sch = context.get("schema") or schema.default_update_notification_schema()
    payload = data_dict.get("payload", False)
    if not payload:
        raise tk.ValidationError("payload is required")

    first_payload = payload[0]
    data, errors = tk.navl_validate(first_payload, sch, context)
    if errors:
        raise tk.ValidationError(errors)

    model = context["model"]
    session = context["session"]
    user_obj = model.User.get(context["user"])

    filtered_payload = [
        {
            f"_{key}": value
            for key, value in notification.items()
            if key
            in {
                "id",
                "recipient_id",
                "sender_id",
                "activity_type",
                "object_type",
                "object_id",
                "time_sent",
                "is_unread",
                "state",
            }
        }
        for notification in payload
    ]

    user_notifications = Notification.bulk_update(notifications=filtered_payload)

    return user_notifications


def pending_dataset_update(context: Context, data_dict: DataDict):
    """Update a Pending Dataset"""
    package_id = data_dict.get("package_id")
    package_data = data_dict.get("package_data")

    if not package_id:
        raise tk.ValidationError(_("package_id is required"))

    if not package_data:
        raise tk.ValidationError(_("package_data is required"))

    tk.check_access("package_create", context, package_data)

    pending_dataset = None

    try:
        pending_dataset = PendingDatasets.update(
            package_id=package_id,
            package_data=package_data,
        )
    except Exception as e:
        log.error(e)
        raise tk.ValidationError(e)

    if not pending_dataset:
        raise logic.NotFound(_(f"Pending Dataset not found: {package_id}"))

    return pending_dataset


def issue_delete(context: Context, data_dict: DataDict):
    return "Issue delete is deprecated"


def package_patch(context: Context, data_dict: DataDict):
    dataset_id = data_dict.get("id")
    try:
        pending_dataset_dict = tk.get_action("pending_dataset_show")(
            context, {"package_id": dataset_id}
        )["package_data"]
    except:
        pending_dataset_dict = None

    if pending_dataset_dict:
        pending_dataset = pending_dataset_dict
    else:
        # Fetch dataset from package_show
        try:
            dataset_dict = tk.get_action("package_show")(context, {"id": dataset_id})
        except Exception as err:
            raise err
        if dataset_dict:
            pending_dataset = dataset_dict

    dataset_details = tk.get_action("package_show")(context, {"id": dataset_id})

    rw_id = data_dict.get("rw_id", None)
    org = None
    if data_dict.get("owner_org"):
        org = tk.get_action("organization_show")(
            context, {"id": data_dict.get("owner_org")}
        )
        org = {
            "id": org.get("id"),
            "name": org.get("name"),
            "title": org.get("title"),
            "description": org.get("description"),
            "image_url": org.get("image_url"),
            "created": org.get("created"),
            "approval_status": org.get("approval_status"),
            "is_organization": org.get("is_organization"),
            "state": org.get("state"),
            "type": org.get("type"),
        }
        pending_dataset["organization"] = org
    data_dict["is_pending"] = True
    data_dict["is_approved"] = False
    data_dict["approval_status"] = "pending"
    _pending_dataset = {**pending_dataset, **data_dict}
    patch_dataset = logic.action.patch.package_patch(
        {"ignore_auth": True},
        {
            "id": dataset_id,
            "approval_status": "pending",
            "visibility_type": (
                _pending_dataset.get("visibility_type")
                if _pending_dataset.get("visibility_type")
                else "draft"
            ),
        },
    )
    try:
        pending_update = tk.get_action("pending_dataset_update")(
            context,
            {
                "package_id": dataset_id,
                "package_data": _pending_dataset,
            },
        )
    except logic.NotFound:
        pending_update = tk.get_action("pending_dataset_create")(
            context,
            {
                "package_id": dataset_id,
                "package_data": _pending_dataset,
            },
        )
        if (
            _pending_dataset.get("visibility_type") != "private"
            and _pending_dataset.get("visibility_type") != "draft"
        ):
            collab = tk.get_action("package_collaborator_list")(
                {"ignore_auth": True}, {"id": dataset["id"]}
            )
            send_group_notification(
                context,
                {
                    "owner_org": dataset.get("owner_org"),
                    "creator_id": dataset.get("creator_user_id"),
                    "collaborator_id": collab,
                    "dataset_id": dataset["id"],
                    "action": "pending_dataset",
                },
            )
    return pending_update.get("package_data")


def approve_pending_dataset(context: Context, data_dict: DataDict):
    dataset_id = data_dict.get("dataset_id")
    # Fetch Pending Dataset Information
    try:
        pending_dataset_dict = tk.get_action("pending_dataset_show")(
            context, {"package_id": dataset_id}
        )["package_data"]
    except:
        pending_dataset_dict = None

    if pending_dataset_dict:
        pending_dataset = pending_dataset_dict
    else:
        # Fetch dataset from package_show
        try:
            dataset_dict = tk.get_action("package_show")(context, {"id": dataset_id})
        except Exception as err:
            raise err
        if dataset_dict:
            pending_dataset = dataset_dict
    # Pretty print pending_dataset

    # Update Dataset Information
    pending_dataset["approval_status"] = "approved"
    pending_dataset["draft"] = False
    pending_dataset["is_approved"] = True

    initial_dataset = tk.get_action("package_show")(context, {"id": dataset_id})
    initial_resources_without_layer = [
        r
        for r in initial_dataset["resources"]
        if not r.get("layerObj") and not r.get("layerObjRaw")
    ]
    resources_without_layer = [
        r
        for r in pending_dataset["resources"]
        if not r.get("layerObj") and not r.get("layerObjRaw")
    ]
    for resource in resources_without_layer:
        default_resource = next(
            (x for x in initial_resources_without_layer if x["id"] == resource["id"]),
            None,
        )
        if default_resource:
            resource["datastore_active"] = default_resource.get("datastore_active")
            resource["hash"] = default_resource.get("hash")
            resource["total_record_count"] = default_resource.get("total_record_count")
            resource["size"] = default_resource.get("size")

    rw_id = pending_dataset.get("rw_id", None)
    is_layer = any(r.get("format") == "Layer" for r in pending_dataset["resources"])
    layer_filter = [r for r in pending_dataset["resources"] if r.get("connectorUrl")]
    layer = layer_filter[0] if layer_filter else None

    if not rw_id and is_layer and layer:
        rw_dataset = {
            "title": pending_dataset.get("title", ""),
            "connectorType": layer.get("connectorType", ""),
            "connectorUrl": layer.get("connectorUrl", ""),
            "provider": layer.get("provider", ""),
            "tableName": layer.get("tableName", ""),
        }
        dataset_rw = create_dataset_rw(rw_dataset)
        rw_id = dataset_rw.get("id")

    # Handle Layer Information
    resources_to_edit_layer = []
    resources_to_create_layer = []

    for resource in pending_dataset["resources"]:
        if (
            ((resource.get("layerObjRaw")) or resource.get("layerObj"))
            and resource.get("rw_id")
            and resource.get("url")
        ):
            resources_to_edit_layer.append(edit_layer_rw(resource))
        if (
            (resource.get("layerObjRaw") or resource.get("layerObjRaw"))
        ) and not resource.get("url"):
            resources_to_create_layer.append(create_layer_rw(resource, rw_id))

    resources = (
        resources_without_layer + resources_to_create_layer + resources_to_edit_layer
    )

    pending_dataset["rw_id"] = rw_id

    # Update resources
    for resource in resources:
        schema = (
            resource.get("schema", {}).get("value")
            if (
                resource.get("schema")
                and isinstance(resource.get("schema"), str) is not True
            )
            else {}
        )
        resource["format"] = resource.get("format", "")
        resource["new"] = False
        resource["layerObjRaw"] = None
        resource["layerObj"] = None
        resource["layer"] = None
        resource["url_type"] = resource.get("type")
        resource["schema"] = {"value": schema} if schema else "{}"
        resource["url"] = resource.get("url", resource.get("name"))

    # Update Dataset
    try:
        dataset = tk.get_action("package_update")(
            {"ignore_auth": True}, pending_dataset
        )
    except Exception as err:
        raise err

    # Close Associated Issues
    try:
        issues = tk.get_action("issue_search")(context, {"dataset_id": dataset["id"]})
    except:
        issues = {"count": 0}

    if issues.get("count") > 0:
        for issue in issues:
            input_data = {
                "issue_number": issue["number"],
                "dataset_id": dataset["id"],
                "status": "closed",
            }
            tk.get_action("issue_update")(context, input_data)

    # Send Notifications
    if dataset.get("visibility_type") not in ["private", "draft"]:
        try:
            collab = tk.get_action("package_collaborator_list")(
                {"ignore_auth": True}, {"id": dataset["id"]}
            ) if ckan.authz.check_config_permission('allow_dataset_collaborators') else []
            send_group_notification(
                context,
                {
                    "owner_org": dataset.get("owner_org"),
                    "creator_id": dataset.get("creator_user_id"),
                    "collaborator_id": collab,
                    "dataset_id": dataset["id"],
                    "action": "approved_dataset",
                },
            )
        except Exception as e:
            print(f"Error in sending issue/comment notification: {e}")
            raise Exception("Error in sending issue/comment notification")

    # Delete Pending Dataset
    delete_data = tk.get_action("pending_dataset_delete")(
        {"ignore_auth": True}, {"package_id": dataset_id}
    )

    if delete_data:
        return dataset


def resource_update(
    context: Context, data_dict: DataDict
) -> ActionResult.ResourceUpdate:
    """Update a resource.

    To update a resource you must be authorized to update the dataset that the
    resource belongs to.

    .. note:: Update methods may delete parameters not explicitly provided in the
        data_dict. If you want to edit only a specific attribute use `resource_patch`
        instead.

    For further parameters see
    :py:func:`~ckan.logic.action.create.resource_create`.

    :param id: the id of the resource to update
    :type id: string

    :returns: the updated resource
    :rtype: string

    """
    model = context["model"]
    id: str = _get_or_bust(data_dict, "id")

    if not data_dict.get("url"):
        data_dict["url"] = ""

    resource = model.Resource.get(id)
    if resource is None:
        raise NotFound("Resource was not found.")
    context["resource"] = resource
    old_resource_format = resource.format

    if not resource:
        log.debug("Could not find resource %s", id)
        raise NotFound(_("Resource was not found."))

    _check_access("resource_update", context, data_dict)
    del context["resource"]

    package_id = resource.package.id
    package_show_context: Union[Context, Any] = dict(context, for_update=True)
    pkg_dict = _get_action("package_show")(package_show_context, {"id": package_id})

    resources = cast("list[dict[str, Any]]", pkg_dict["resources"])
    for n, p in enumerate(resources):
        if p["id"] == id:
            break
    else:
        log.error("Could not find resource %s after all", id)
        raise NotFound(_("Resource was not found."))

    # Persist the datastore_active extra if already present and not provided
    if "datastore_active" in resource.extras and "datastore_active" not in data_dict:
        data_dict["datastore_active"] = resource.extras["datastore_active"]

    for plugin in plugins.PluginImplementations(plugins.IResourceController):
        plugin.before_resource_update(context, pkg_dict["resources"][n], data_dict)

    resources[n] = data_dict

    try:
        context["use_cache"] = False
        updated_pkg_dict = _get_action("package_update")(context, pkg_dict)
    except ValidationError as e:
        try:
            error_dict = cast("list[ErrorDict]", e.error_dict["resources"])[n]
        except (KeyError, IndexError):
            error_dict = e.error_dict
        raise ValidationError(error_dict)

    resource = _get_action("resource_show")(context, {"id": id})

    if old_resource_format != resource["format"]:
        _get_action("resource_create_default_resource_views")(
            {"model": context["model"], "user": context["user"], "ignore_auth": True},
            {"package": updated_pkg_dict, "resource": resource},
        )

    for plugin in plugins.PluginImplementations(plugins.IResourceController):
        plugin.after_resource_update(context, resource)

    return resource
