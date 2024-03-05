from ckan.types import ActionResult, Context, DataDict
from typing_extensions import TypeAlias
import logging
from ckanext.wri.model.notification import Notification, notification_list_dictize
from ckanext.wri.model.pending_datasets import PendingDatasets
from ckanext.wri.model.resource_location import ResourceLocation
from ckanext.wri.logic.auth import schema
import ckan.plugins.toolkit as tk
import ckan.logic as logic
from ckan.common import _

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


# NOTE: not meant to be used via API, no auth validation
def resource_location_update(context: Context, data_dict: DataDict):
    """Update a resource location"""
    resource_id = data_dict.get("resource_id")
    spatial_address = data_dict.get("spatial_address")
    spatial_geom = data_dict.get("spatial_geom")

    if not resource_id:
        raise tk.ValidationError(_("resource_id is required"))

    resource_location = None

    try:
        resource_location = ResourceLocation.update(
            resource_id=resource_id,
            spatial_geom=spatial_geom,
            spatial_address=spatial_address,
        )
    except Exception as e:
        log.error(e)
        raise tk.ValidationError(e)

    if not resource_location:
        raise logic.NotFound(_(f"Resource location not found: {resource_id}"))

    return resource_location
