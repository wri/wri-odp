from contextlib import contextmanager
from ckan.model import meta
import logging


log = logging.getLogger(__name__)


@contextmanager
def sql_session_scope(raise_exceptions: bool = True):
    session = meta.Session()

    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()

        log.error(f"An error occurred while executing a database operation: {str(e)}")

        if raise_exceptions:
            raise
    finally:
        session.close()
