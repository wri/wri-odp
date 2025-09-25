import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from ckan.model import meta
from geoalchemy2 import Geometry
import uuid
import datetime


def make_uuid():
    return str(uuid.uuid4())


def create_tables():
    engine = meta.engine
    metadata = meta.metadata

    sa.Table(
        "pending_datasets",
        metadata,
        sa.Column("package_id", sa.UnicodeText, primary_key=True),
        sa.Column("package_data", postgresql.JSONB, nullable=False),
        sa.Column(
            "last_modified",
            sa.DateTime,
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
        extend_existing=True,
    )

    sa.Table(
        "notification",
        metadata,
        sa.Column("id", sa.UnicodeText, primary_key=True, default=make_uuid),
        sa.Column(
            "recipient_id",
            sa.UnicodeText,
            sa.ForeignKey("user.id", onupdate="CASCADE", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "sender_id",
            sa.UnicodeText,
            sa.ForeignKey("user.id", onupdate="CASCADE", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("activity_type", sa.UnicodeText, nullable=False),
        sa.Column("object_type", sa.UnicodeText, nullable=False),
        sa.Column("object_id", sa.UnicodeText, nullable=False),
        sa.Column("time_sent", sa.DateTime, nullable=False),
        sa.Column("is_unread", sa.Boolean, nullable=False),
        sa.Column("state", sa.UnicodeText, nullable=False),
        extend_existing=True,
    )

    sa.Table(
        "download_event",
        metadata,
        sa.Column("id", sa.UnicodeText, primary_key=True, default=make_uuid),
        sa.Column("download_id", sa.UnicodeText, nullable=True),
        sa.Column("email", sa.UnicodeText, nullable=True),
        sa.Column("first_name", sa.UnicodeText, nullable=True),
        sa.Column("last_name", sa.UnicodeText, nullable=True),
        sa.Column("affiliation", sa.UnicodeText, nullable=True),
        sa.Column("organization", sa.UnicodeText, nullable=True),
        sa.Column("job_title", sa.UnicodeText, nullable=True),
        sa.Column("country", sa.UnicodeText, nullable=True),
        sa.Column("interests", sa.UnicodeText, nullable=True),
        sa.Column(
            "package",
            sa.UnicodeText,
            sa.ForeignKey("package.id", onupdate="CASCADE", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "resource_id",
            sa.UnicodeText,
            sa.ForeignKey("resource.id", onupdate="CASCADE", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            default=datetime.datetime.utcnow,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            default=datetime.datetime.utcnow,
            onupdate=datetime.datetime.utcnow,
        ),
        extend_existing=True,
    )

    sa.Table(
        "resource_location",
        metadata,
        sa.Column("id", sa.UnicodeText, primary_key=True, default=make_uuid),
        sa.Column("resource_id", sa.UnicodeText),
        sa.Column("spatial_address", sa.UnicodeText, nullable=True),
        sa.Column("spatial_coordinates", Geometry("POINT", spatial_index=False), nullable=True),
        sa.Column("spatial_geom", Geometry("GEOMETRY", spatial_index=False), nullable=True),
        sa.Column("is_pending", sa.Boolean, nullable=True),
        extend_existing=True,
    )

    metadata.create_all(bind=engine)
