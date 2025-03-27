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
        
def update_download_event():
    """
    Updates the download_event table schema by adding new columns if they don't exist.
    This function should be called after adding new columns to the DownloadEvent model.
    """
    from sqlalchemy import create_engine, MetaData
    from sqlalchemy.engine import reflection
    from ckan.model import meta
    
    log.info("Checking for new columns in download_event table")
    
    # Get existing columns
    inspector = reflection.Inspector.from_engine(meta.engine)
    existing_columns = [column['name'] for column in inspector.get_columns('download_event')]
    
    # Get model columns
    model_columns = [column.name for column in download_event.c]
    
    # Find new columns
    new_columns = set(model_columns) - set(existing_columns)
    
    if new_columns:
        connection = meta.engine.connect()
        trans = connection.begin()
        try:
            for column_name in new_columns:
                column = download_event.c[column_name]
                nullable = 'NOT NULL' if not column.nullable else ''
                default = f"DEFAULT {column.default.arg}" if column.default else ''
                type_name = column.type.compile(meta.engine.dialect)
                
                sql = f'ALTER TABLE download_event ADD COLUMN {column_name} {type_name} {nullable} {default}'
                connection.execute(sql)
                log.info(f"Added new column {column_name} to download_event table")
                
            trans.commit()
            log.info("Successfully updated download_event table schema")
        except Exception as e:
            log.error(f"Error updating download_event table schema: {str(e)}")
            trans.rollback()
            raise
        finally:
            connection.close()
    else:
        log.info("No new columns to add to download_event table")
