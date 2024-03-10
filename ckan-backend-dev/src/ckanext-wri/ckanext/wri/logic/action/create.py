from typing_extensions import TypeAlias
import logging

from ckanext.wri.model.notification import Notification, notification_dictize
from ckanext.wri.model.pending_datasets import PendingDatasets
from ckanext.wri.logic.auth import schema
from ckanext.wri.lib.resource_location import update_resource_location
from ckan.types import Context
from typing import cast
from ckan import model

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

        resources = package_data.get("resources")
        if resources is not None:
            context = cast(Context, {
                u'model': model,
                u'ignore_auth': True,
                u'defer_commit': True
            })
            for resource in resources:
                update_resource_location(context, resource, is_pending=True)

    except Exception as e:
        log.error(e)
        raise tk.ValidationError(e)

    if not pending_dataset:
        raise tk.ValidationError(_(f"Pending Dataset not found: {package_id}"))

    return pending_dataset

