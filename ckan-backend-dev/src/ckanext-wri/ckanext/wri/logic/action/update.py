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
            dataset_dict = tk.get_action("package_show")(context, {"id": dataset_id})[
                "package_data"
            ]
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
        schema = resource.get("schema", {}).get("value")
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
        dataset = tk.get_action("package_update")(context, pending_dataset)
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
            tk.get_action("issue_update")(context, input_data)

    # Send Notifications
    if dataset.get("visibility_type") not in ["private", "draft"]:
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
    delete_data = tk.get_action("pending_dataset_delete")(
        context, {"package_id": dataset_id}
    )

    if delete_data:
        return dataset


class GroupNotificationParams(TypedDict):
    owner_org: Optional[str]
    creator_id: str
    collaborator_id: str
    dataset_id: str
    session: str
    action: str


def get_all_users():
    import sqlalchemy

    _select = sqlalchemy.sql.select
    _func = sqlalchemy.func
    return model.Session.query(
        model.User,
        model.User.name.label("name"),
        model.User.fullname.label("fullname"),
        model.User.about.label("about"),
        model.User.email.label("email"),
        model.User.created.label("created"),
        _select(_func.count(model.Package.id))
        .where(
            model.Package.creator_user_id == model.User.id,
            model.Package.state == "active",
            model.Package.private == False,
        )
        .label("number_created_packages"),
    ).all()


def send_group_notification(context, GroupNotificationParams):
    recipient_ids = []
    recipient_users = []
    owner_org = GroupNotificationParams.get("owner_org")
    creator_id = GroupNotificationParams.get("creator_id")
    collaborator_id = GroupNotificationParams.get("collaborator_id")
    dataset_id = GroupNotificationParams.get("dataset_id")
    action = GroupNotificationParams.get("action")
    if owner_org:
        _context = context.copy()
        _context["ignore_auth"] = True
        org = tk.get_action("organization_show")(_context, {"id": owner_org})
        org_users = org["users"]
        recipient_users = list(
            filter(
                lambda u: u["capacity"] == "admin" or u["capacity"] == "member",
                org_users,
            )
        )
        recipient_ids = list(map(lambda u: u["id"], recipient_users))
    if not any(user["id"] == creator_id for user in recipient_users) and creator_id:
        recipient_ids.append(creator_id)
        creator_user = tk.get_action("user_show")(context, {"id": creator_id})
        if recipient_users:
            recipient_users.append(creator_user)
        else:
            recipient_users = [creator_user]
    if collaborator_id:
        recipient_ids.extend(collaborator_id)
        collaborator_users = [
            tk.get_action("user_show")(context, {"id", id}) for id in collaborator_id
        ]

        if recipient_users:
            recipient_users.extend(collaborator_users)
        else:
            recipient_users = collaborator_users

    # get all admin users
    all_users = tk.get_action("user_list")(
        {**context, **{"ignore_auth": True}}, {"all_fields": True}
    )
    all_users = [
        user
        for user in all_users
        if not any(s["id"] == user["id"] for s in recipient_users) and user["sysadmin"]
    ]
    all_user_ids = [user["id"] for user in all_users]
    recipient_ids.extend(all_user_ids)

    if recipient_users:
        recipient_users.extend(all_users)
    else:
        recipient_users = all_users

    dataset = tk.get_action("package_show")(context, {"id": dataset_id})
    if len(recipient_ids) > 0:
        notifications_sent = [
            tk.get_action("notification_create")(
                context,
                {
                    "recipient_id": recipient_id,
                    "sender_id": context["auth_user_obj"].id,
                    "activity_type": action,
                    "object_type": "dataset",
                    "object_id": dataset_id,
                    "is_unread": True,
                },
            )
            for recipient_id in recipient_ids
        ]
        if recipient_users:
            for recipient_user in recipient_users:
                if recipient_user.get("email"):
                    user_obj = model.User.get(recipient_user.get("id"))
                    mainAction = action.split("_")[0]
                    subject = f"Approval status on dataset {dataset['title']}"
                    body = f"""
                    <p>Hi {
                                recipient_user['display_name'] if recipient_user.get('display_name') else recipient_user['name']
                            }</p>
                        <p>The approval status for the dataset <a href="{
                            tk.config.get("ckan.frontend_url")
                        }/datasets/{dataset['name']}">${
                            dataset['title']
                        }</a> is now <b><string>${mainAction}</strong><b></p>
                    """
                    tk.mail_user(user_obj, subject, body)
