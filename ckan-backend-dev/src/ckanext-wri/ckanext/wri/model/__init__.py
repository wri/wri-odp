from .notification import Notification, notification
from ckan import model
import logging

log = logging.getLogger(__name__)

__all__ = ["Notification"]

def setup():
    """
    Create Notifications Table in the database.
    """
    if not notification.exists():
        notification.create(checkfirst=True)
        log.info('Tables created for notifications')
    else:
        log.info('Notificaitons Table already exists')