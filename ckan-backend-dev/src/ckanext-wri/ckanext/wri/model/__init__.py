from .notification import Notification, notification
from .pending_datasets import pending_datasets
from .resource_location import resource_location
from .download_event import download_event
from ckan.model import ensure_engine
import logging

log = logging.getLogger(__name__)

__all__ = ["Notification"]


def setup():
    """
    Create Notifications Table in the database.
    """
    engine = ensure_engine()
    if not notification.exists(engine):
        notification.create(engine, checkfirst=True)
        log.info("Tables created for notifications")
    else:
        log.info("Notifications Table already exists")


def setup_pending_datasets():
    """
    Create Pending Datasets Table in the database.
    """
    engine = ensure_engine()
    if not pending_datasets.exists(engine):
        pending_datasets.create(engine, checkfirst=True)
        log.info("Tables created for pending datasets")
    else:
        log.info("Pending Datasets Table already exists")


def setup_resource_location():
    engine = ensure_engine()
    if not resource_location.exists(engine):
        resource_location.create(engine, checkfirst=True)
        log.info("Resource location table created")
    else:
        log.info("Resource location table already exists")

def setup_download_event():
    engine = ensure_engine()
    if not download_event.exists(engine):
        download_event.create(engine, checkfirst=True)
        log.info("Download event table created")
    else:
        log.info("Download event table already exists")
