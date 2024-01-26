from .notification import Notification, notification
from .pending_datasets import pending_datasets
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
        log.info('Notifications Table already exists')

def setup_pending_datasets():
    """
    Create Pending Datasets Table in the database.
    """
    if not pending_datasets.exists():
        pending_datasets.create(checkfirst=True)
        log.info('Tables created for pending datasets')
    else:
        log.info('Pending Datasets Table already exists')
