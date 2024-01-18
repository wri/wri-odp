# -*- coding: utf-8 -*-

from __future__ import annotations

from ckan.logic.schema import validator_args, default_pagination_schema
from ckan.types import Schema, Validator, ValidatorFactory
from ckanext.wri.logic.validators import mutually_exclusive


@validator_args
def default_create_notification_schema(
    ignore: Validator,
    not_missing: Validator,
    not_empty: Validator,
    unicode_safe: Validator,
    ignore_empty: Validator,
    ignore_missing: Validator,
) -> Schema:
    return {
        "recipient_id": [
            not_missing,
            not_empty,
            unicode_safe,
        ],
        "sender_id": [
            not_missing,
            not_empty,
            unicode_safe,
        ],
        "activity_type": [
            not_missing,
            not_empty,
            unicode_safe,
        ],
        "object_type": [
            not_missing,
            not_empty,
            unicode_safe,
        ],
        "object_id": [
            not_missing,
            not_empty,
            unicode_safe,
        ],
        "time_sent": [ignore_empty, ignore_missing],
        "is_unread": [ignore_empty, ignore_missing],
        "state": [ignore_empty, ignore_missing]
    }

@validator_args
def default_update_notification_schema(
    ignore: Validator,
    not_missing: Validator,
    not_empty: Validator,
    unicode_safe: Validator,
    ignore_empty: Validator,
    ignore_missing: Validator,
) -> Schema:
    return {
        "id": [
            not_missing,
            not_empty,
            unicode_safe,
        ],
        "recipient_id": [
            not_missing,
            not_empty,
            unicode_safe,
        ],
        "sender_id": [
            not_missing,
            not_empty,
            unicode_safe,
        ],
        "activity_type": [
            not_missing,
            not_empty,
            unicode_safe,
        ],
        "object_type": [
            not_missing,
            not_empty,
            unicode_safe,
        ],
        "object_id": [
            not_missing,
            not_empty,
            unicode_safe,
        ],
        "time_sent": [
            not_missing,
            not_empty,
            unicode_safe,
        ],
        "is_unread":[
            not_missing,
            not_empty,
            unicode_safe,
        ],
        "state":[
            not_missing,
            not_empty,
            unicode_safe,
        ],
    }


@validator_args
def default_get_notification_schema(
    ignore: Validator,
    not_missing: Validator,
    not_empty: Validator,
    unicode_safe: Validator,
    ignore_empty: Validator,
    ignore_missing: Validator,
) -> Schema:
    return {
        "recipient_id": [
            unicode_safe,
            mutually_exclusive('sender_id'),
            ignore_missing
        ],
        "sender_id": [
            unicode_safe,
            mutually_exclusive('recipient_id'),
            ignore_missing
        ],
        "activity_type": [ignore_empty, ignore_missing],
        "object_type": [ignore_empty, ignore_missing],
        "object_id": [ignore_empty, ignore_missing],
        "time_sent": [ignore_empty, ignore_missing],
        "is_unread":[ignore_empty, ignore_missing],
        "state": [ignore_empty, ignore_missing]
    }

@validator_args
def default_create_pending_dataset_schema(
    not_missing: Validator,
    not_empty: Validator,
    unicode_safe: Validator,
) -> Schema:
    return {
        "package_id": [
            not_missing,
            not_empty,
            unicode_safe,
        ],
        "package_data": [
            not_missing,
            not_empty,
            unicode_safe,
        ],
    }

@validator_args
def default_update_pending_dataset_schema(
    not_missing: Validator,
    not_empty: Validator,
    unicode_safe: Validator,
) -> Schema:
    return {
        "package_id": [
            not_missing,
            not_empty,
            unicode_safe,
        ],
        "package_data": [
            not_missing,
            not_empty,
            unicode_safe,
        ],
    }

@validator_args
def default_get_pending_dataset_schema(
    not_missing: Validator,
    not_empty: Validator,
    unicode_safe: Validator,
) -> Schema:
    return {
        "package_id": [
            not_missing,
            not_empty,
            unicode_safe,
        ],
    }

@validator_args
def default_delete_pending_dataset_schema(
    not_missing: Validator,
    not_empty: Validator,
    unicode_safe: Validator,
) -> Schema:
    return {
        "package_id": [
            not_missing,
            not_empty,
            unicode_safe,
        ],
    }
