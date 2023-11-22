# encoding: utf-8

import datetime
import sqlalchemy
from sqlalchemy.orm import Mapped
import ckan.model.meta as meta
from typing import Optional
from typing_extensions import Self

activity_viewed = sqlalchemy.Table('activity_viewed', meta.metadata,
    sqlalchemy.Column('user_id', sqlalchemy.types.UnicodeText,
        sqlalchemy.ForeignKey('user.id', onupdate='CASCADE',
            ondelete='CASCADE'),
        primary_key=True, nullable=False),
    sqlalchemy.Column('activity_id', sqlalchemy.types.UnicodeText,
        sqlalchemy.ForeignKey('activity.id', onupdate='CASCADE',
            ondelete='CASCADE'),
        primary_key=True, nullable=False),
    sqlalchemy.Column('last_viewed', sqlalchemy.types.DateTime,
        nullable=True),
    sqlalchemy.Column('status', sqlalchemy.types.UnicodeText,
        nullable=False),
)

class ActivityViewed(object):
    '''Saved data used for the user's activity.'''
    user_id: Mapped[str]
    activity_id: Mapped[str]
    last_viewed: Mapped[datetime.datetime]
    status: Mapped[str]

    def __init__(self, user_id: str, activity_id: str) -> None:
        self.user_id = user_id
        self.activity_id = activity_id
        self.last_viewed = datetime.datetime.utcnow()
        self.status = "active"

    @classmethod
    def get(cls, user_id: str) -> Optional[Self]:
        '''Return the ActivityViewed object for the given user_id.

        If there's no ActivityViewed row in the database for this user_id, a fresh
        one will be created and returned.

        '''
        query = meta.Session.query(ActivityViewed)
        query = query.filter(ActivityViewed.user_id == user_id)
        return query.first()

meta.mapper(ActivityViewed, activity_viewed)