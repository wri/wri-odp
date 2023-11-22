from .activity_viewed import ActivityViewed, activity_viewed
from ckan import model
import logging

log = logging.getLogger(__name__)

__all__ = ["ActivityViewed"]

def setup():
    """
    Create Activity Viewed Table in the database.
    """
    if not activity_viewed.exists():
        activity_viewed.create(checkfirst=True)
        log.info('Tables created for activity_viewed')
    else:
        log.info('Activity Viewed Table already exists')