import pytest
from ckanext.wri.tests.create_tables import create_tables
import http.server


@pytest.fixture
def clean_db(reset_db, migrate_db_for):
    reset_db()
    migrate_db_for("harvest")
    create_tables()


original_handle = http.server.BaseHTTPRequestHandler.handle


def safe_handle(self):
    try:
        original_handle(self)
    except ValueError as e:
        if "closed file" not in str(e):
            raise


@pytest.fixture(scope="session", autouse=True)
def patch_handler():
    http.server.BaseHTTPRequestHandler.handle = safe_handle
