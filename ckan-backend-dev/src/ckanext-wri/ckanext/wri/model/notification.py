# encoding: utf-8

import datetime
import sqlalchemy
from sqlalchemy.orm import Mapped
import ckan.model.meta as meta
import ckan.model.types as _types
from typing import Optional
from typing_extensions import Self
from ckan.lib.dictization import table_dictize
from ckan.types import Context, Query
from typing import Any, Iterable, Optional, Type, TypeVar
import ckan.model as model
from sqlalchemy import and_
from sqlalchemy import update
from sqlalchemy import bindparam
from typing import Union
import logging
log = logging.getLogger(__name__)

from .sql_context import sql_session_scope


notification = sqlalchemy.Table('notification', meta.metadata,
    sqlalchemy.Column('id', sqlalchemy.types.UnicodeText,
        primary_key=True, default=_types.make_uuid),
    sqlalchemy.Column('recipient_id', sqlalchemy.types.UnicodeText,
        sqlalchemy.ForeignKey('user.id', onupdate='CASCADE',
            ondelete='CASCADE'),
        nullable=False),
    sqlalchemy.Column('sender_id', sqlalchemy.types.UnicodeText,
        sqlalchemy.ForeignKey('user.id', onupdate='CASCADE',
            ondelete='CASCADE'),
        nullable=False),
    sqlalchemy.Column('activity_type', sqlalchemy.types.UnicodeText,
        nullable=False),
    sqlalchemy.Column('object_type', sqlalchemy.types.UnicodeText,
        nullable=False),
    sqlalchemy.Column('object_id', sqlalchemy.types.UnicodeText,
        nullable=False),
    sqlalchemy.Column('time_sent', sqlalchemy.types.DateTime,
        nullable=False),
    sqlalchemy.Column('is_unread', sqlalchemy.types.Boolean,
        nullable=False),
    sqlalchemy.Column('state', sqlalchemy.types.UnicodeText,
        nullable=False),
)

class Notification(object):
    '''Saved data used for the user's notifications.'''
    id: str
    recipient_id: str
    sender_id: str
    activity_type: str
    object_type: str
    object_id: str
    time_sent: datetime.datetime
    is_unread: bool
    state: str

    def __init__(self, recipient_id: str, sender_id: str, activity_type:str, object_type:str, 
    object_id:str) -> None:
        self.recipient_id = recipient_id
        self.sender_id = sender_id
        self.activity_type = activity_type
        self.object_type = object_type
        self.object_id = object_id
        self.time_sent = datetime.datetime.utcnow()
        self.is_unread = True
        self.state = "active"

    @classmethod
    def get(cls, recipient_id: str, sender_id: Optional[str] = None) -> Optional['Notification']:
        '''Return the Notification object for the given user_id.

        If there's no Notification row in the database for this user_id, a fresh
        one will be created and returned.

        '''
        with sql_session_scope(raise_exceptions=False) as session:
            query = session.query(Notification)

            if sender_id:
                query = query.filter(Notification.sender_id == sender_id)
            if recipient_id:
                query = query.filter(Notification.recipient_id == recipient_id)

            return query.all()
    
    @classmethod
    def update(
        cls,
        notification_id: str,
        recipient_id: str,
        sender_id: str,
        activity_type: str,
        object_type: str,
        object_id: str,
        time_sent: datetime.datetime,
        is_unread: bool,
        state: str,
    ) -> Optional['Notification']:
        with sql_session_scope() as session:
            stmt = (
                update(Notification)
                .where(Notification.id == notification_id)
                .values(
                    recipient_id=recipient_id,
                    sender_id=sender_id,
                    activity_type=activity_type,
                    object_type=object_type,
                    object_id=object_id,
                    time_sent=time_sent,
                    is_unread=is_unread,
                    state=state
                )
                .returning(Notification)
            )

            result = session.execute(stmt)
            return result.fetchall()
    
    @classmethod
    def bulk_update(
        cls,
        notifications: list[dict[str, Union[str, datetime.datetime, bool]]],
    ) -> Optional['Notification']:
        with sql_session_scope() as session:
            stmt = (
                update(Notification)
                .where(Notification.id == bindparam('_id'))
                .values(
                    recipient_id=bindparam('_recipient_id'),
                    sender_id=bindparam('_sender_id'),
                    activity_type=bindparam('_activity_type'),
                    object_type=bindparam('_object_type'),
                    object_id=bindparam('_object_id'),
                    time_sent=bindparam('_time_sent'),
                    is_unread=bindparam('_is_unread'),
                    state=bindparam('_state')
                )
            )

            result = session.execute(stmt, notifications)
            return result.rowcount


def notification_dictize(notification: Notification, context: Context) -> dict[str, Any]:
    return table_dictize(notification, context)

def notification_list_dictize(
    notification_list: Iterable[Notification], context: Context
) -> list[dict[str, Any]]:
    return [notification_dictize(notification, context) for notification in notification_list]

meta.mapper(Notification, notification)
