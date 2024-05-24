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


def approve_pending_dataset(context: Context, data_dict: DataDict):
    print("HERE", flush=True)
    dataset_id = data_dict.get("dataset_id")
    # Fetch Pending Dataset Information
    try:
        pending_dataset_dict = tk.get_action("pending_dataset_show")(
            context, {"package_id": dataset_id}
        )["package_data"]
        print("HERE 2-1", flush=True)
    except:
        pending_dataset_dict = None

    if pending_dataset_dict:
        pending_dataset = pending_dataset_dict
    else:
        # Fetch dataset from package_show
        try:
            dataset_dict = tk.get_action("package_show")(context, {"id": dataset_id})
            print(dataset_dict, flush=True)
            print("HERE 2-2", flush=True)
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
    print("HERE 3", flush=True)
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
        print("DATASET RW", flush=True)
        print(dataset_rw, flush=True)
        rw_id = dataset_rw.get("id")

    # Handle Layer Information
    resources_to_edit_layer = []
    resources_to_create_layer = []

    for resource in pending_dataset["resources"]:
        if (resource.get("layer")) and resource.get("rw_id") and resource.get("url"):
            resources_to_edit_layer.append(edit_layer_rw(resource))
        if (resource.get("layer")) and not resource.get("url"):
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
    print("HERE 4", flush=True)
    try:
        print("HERE 5", flush=True)
        dataset = tk.get_action("package_update")(
            {"ignore_auth": True}, pending_dataset
        )
    except Exception as err:
        raise err

    # Close Associated Issues
    issues = tk.get_action("issue_search")(context, {"dataset_id": dataset["id"]})

    if issues.get("count") > 0:
        for issue in issues:
            input_data = {
                "issue_number": issue["number"],
                "dataset_id": dataset["id"],
                "status": "closed",
            }
            print("HERE 6", flush=True)
            tk.get_action("issue_update")(context, input_data)

    # Send Notifications
    if dataset.get("visibility_type") not in ["private", "draft"]:
        print("HERE 7", flush=True)
        try:
            collab = tk.get_action("package_collaborator_list")(
                context, {"id": dataset["id"]}
            )
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
    print("HERE 8", flush=True)
    delete_data = tk.get_action("pending_dataset_delete")(
        { "ignore_auth": True }, {"package_id": dataset_id}
    )

    if delete_data:
        return dataset
