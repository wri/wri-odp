# encoding: utf-8

import datetime
import sqlalchemy
from sqlalchemy.orm import Mapped
import ckan.model.meta as meta
from typing import Optional
from typing_extensions import Self
from ckan.lib.dictization import table_dictize
from ckan.types import Context, Query
from typing import Any, Iterable, Optional, Type, TypeVar
import ckan.model as model
from sqlalchemy import and_

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
    user_id: str
    activity_id: str
    last_viewed: datetime.datetime
    status: str

    def __init__(self, user_id: str, activity_id: str) -> None:
        self.user_id = user_id
        self.activity_id = activity_id
        self.last_viewed = datetime.datetime.utcnow()
        self.status = "active"
        import logging
        logging.error('++++++++++++++++++++++++++++++++++++')

    @classmethod
    def get(cls, user_id: str, activity_id: Optional[str] = None) -> Optional['ActivityViewed']:
        '''Return the ActivityViewed object for the given user_id.

        If there's no ActivityViewed row in the database for this user_id, a fresh
        one will be created and returned.

        '''
        query = meta.Session.query(ActivityViewed)
        
        query = query.filter(ActivityViewed.user_id == user_id)

        if activity_id:
            filter_conditions = [ActivityViewed.user_id == user_id]
            filter_conditions.append(ActivityViewed.activity_id == activity_id)
            query = query.filter(and_(*filter_conditions))
            return query.first()
        return query.all()

def activity_dictize(activity: ActivityViewed, context: Context) -> dict[str, Any]:
    return table_dictize(activity, context)

def activity_list_dictize(
    activity_list: Iterable[ActivityViewed], context: Context
) -> list[dict[str, Any]]:
    return [activity_dictize(activity, context) for activity in activity_list]

meta.mapper(ActivityViewed, activity_viewed)