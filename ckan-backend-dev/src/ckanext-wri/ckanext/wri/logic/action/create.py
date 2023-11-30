from ckan.types import ActionResult, Context, DataDict
from typing_extensions import TypeAlias
import logging
from ckanext.wri.model.notification import Notification, notification_dictize
import ckan.plugins.toolkit as tk
from ckanext.wri.logic.auth import schema

NotificationGetUserViewedActivity: TypeAlias = None
log = logging.getLogger(__name__)

def notification_create(context: Context, data_dict: DataDict) -> NotificationGetUserViewedActivity:
    """Create a Notification by providing Sender and Recipient"""
    
    model = context["model"]
    session = context['session']
    user_obj = model.User.get(context["user"])

    tk.check_access("notification_create", context, data_dict)
    sch = context.get("schema") or schema.default_create_notification_schema()
    data, errors = tk.navl_validate(data_dict, sch, context)
    if errors:
        raise tk.ValidationError(errors)

    recipient_id = data_dict.get('recipient_id')
    sender_id = data_dict.get('sender_id')
    activity_type = data_dict.get('activity_type')
    object_type = data_dict.get('object_type')
    object_id = data_dict.get('object_id')

    user_notifications = Notification(
        recipient_id=recipient_id,
        sender_id=sender_id,
        activity_type=activity_type,
        object_type=object_type,
        object_id=object_id
    )

    session.add(user_notifications)

    if not context.get('defer_commit'):
        model.repo.commit()

    notification_dicts = notification_dictize(user_notifications, context)
    return notification_dicts
