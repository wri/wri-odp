from ckan.types import ActionResult, Context, DataDict
from typing_extensions import TypeAlias
import logging
from ckanext.wri.model.notification import Notification, notification_list_dictize
from ckanext.wri.logic.auth import schema
import ckan.plugins.toolkit as tk
import ckan.logic as logic
from ckan.common import _

NotificationGetUserViewedActivity: TypeAlias = None
log = logging.getLogger(__name__)

def notification_update(context: Context, data_dict: DataDict) -> NotificationGetUserViewedActivity:
    """Update notification status for a user"""
    
    tk.check_access("notification_create", context, data_dict)
    sch = context.get("schema") or schema.default_update_notification_schema()
    data, errors = tk.navl_validate(data_dict, sch, context)
    if errors:
        raise tk.ValidationError(errors)

    model = context["model"]
    session = context['session']
    user_obj = model.User.get(context["user"])

    if not data_dict.get("id"):
        return

    notification_id = data_dict.get("id")
    recipient_id = data_dict.get('recipient_id')
    sender_id = data_dict.get('sender_id')
    activity_type = data_dict.get('activity_type')
    object_type = data_dict.get('object_type')
    object_id = data_dict.get('object_id')
    time_sent = data_dict.get('time_sent')
    is_unread = data_dict.get('is_unread')
    state = data_dict.get('state')

    user_notifications = Notification.update(
        notification_id=notification_id,
        recipient_id=recipient_id,
        sender_id=sender_id,
        activity_type=activity_type,
        object_type=object_type,
        object_id=object_id,
        time_sent=time_sent,
        is_unread=is_unread,
        state=state
    )

    notification_dicts = notification_list_dictize(user_notifications, context)
    if not notification_dicts:
        raise logic.NotFound(_('Notification not found'))
    return notification_dicts