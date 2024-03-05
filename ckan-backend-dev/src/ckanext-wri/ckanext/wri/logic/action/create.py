from typing_extensions import TypeAlias
import logging

from ckanext.wri.model.notification import Notification, notification_dictize
from ckanext.wri.model.pending_datasets import PendingDatasets
from ckanext.wri.model.resource_location import ResourceLocation
from ckanext.wri.logic.auth import schema

from ckan.common import _
import ckan.plugins.toolkit as tk
from ckan.types import Context, DataDict

NotificationGetUserViewedActivity: TypeAlias = None
log = logging.getLogger(__name__)


def notification_create(
    context: Context, data_dict: DataDict
) -> NotificationGetUserViewedActivity:
    """Create a Notification by providing Sender and Recipient"""

    model = context["model"]
    session = context["session"]
    user_obj = model.User.get(context["user"])

    tk.check_access("notification_create", context, data_dict)
    sch = context.get("schema") or schema.default_create_notification_schema()
    data, errors = tk.navl_validate(data_dict, sch, context)
    if errors:
        raise tk.ValidationError(errors)

    recipient_id = data_dict.get("recipient_id")
    sender_id = data_dict.get("sender_id")
    activity_type = data_dict.get("activity_type")
    object_type = data_dict.get("object_type")
    object_id = data_dict.get("object_id")

    user_notifications = Notification(
        recipient_id=recipient_id,
        sender_id=sender_id,
        activity_type=activity_type,
        object_type=object_type,
        object_id=object_id,
    )

    session.add(user_notifications)

    if not context.get("defer_commit"):
        model.repo.commit()

    notification_dicts = notification_dictize(user_notifications, context)
    return notification_dicts


def pending_dataset_create(context: Context, data_dict: DataDict):
    """Create a Pending Dataset"""
    package_id = data_dict.get("package_id")
    package_data = data_dict.get("package_data")
    log.error(package_data)

    if not package_id:
        raise tk.ValidationError(_("package_id is required"))

    if not package_data:
        raise tk.ValidationError(_("package_data is required"))

    tk.check_access("package_update", context, package_data)

    pending_dataset = None

    try:
        pending_dataset = PendingDatasets.create(package_id, package_data)
    except Exception as e:
        log.error(e)
        raise tk.ValidationError(e)

    if not pending_dataset:
        raise tk.ValidationError(_(f"Pending Dataset not found: {package_id}"))

    return pending_dataset


# NOTE: not validating auth because this action is not meant to
# be used via API and this way we prevent unnecessary DB queries
def resource_location_create(context: Context, data_dict):
    """Create resource location for a resource"""
    resource_id = data_dict.get("resource_id")
    spatial_address = data_dict.get("spatial_address")
    spatial_geom = data_dict.get("spatial_geom")

    if not resource_id:
        raise tk.ValidationError(_("resource_id is required"))

    resource_location = None
    try:
        resource_location = ResourceLocation.create(resource_id,
                                                    spatial_address,
                                                    spatial_geom)
    except Exception as e:
        log.error(e)
        raise tk.ValidationError(e)

    if not resource_location:
        raise tk.ValidationError(
                _(f"Resource Location not found: {resource_id}"))

    return resource_location
