from ckan.types import ActionResult, Context, DataDict
from typing_extensions import TypeAlias
import logging
from ckanext.wri.model.notification import Notification, notification_dictize

NotificationGetUserViewedActivity: TypeAlias = None
log = logging.getLogger(__name__)

def notification_create(context: Context, data_dict: DataDict) -> NotificationGetUserViewedActivity:
    """Get the activity status for a user and add it to the database if not already present."""
    
    model = context["model"]
    session = context['session']
    user_obj = model.User.get(context["user"])

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
