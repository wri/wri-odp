import datetime
from typing import Any
import pycountry
import logging
import json

from ckan.types import Context
from ckan.plugins.toolkit import ValidationError
import ckan.lib.navl.dictization_functions as df
from ckan.lib.navl.dictization_functions import StopOnError
from ckan.lib.navl.validators import (
    FlattenKey,
    FlattenDataDict,
    FlattenErrorDict,
    Context,
    Validator,
)
from ckan.lib.navl.dictization_functions import missing
from ckan.common import _
from ckan.logic.validators import email_validator


Invalid = df.Invalid

log = logging.getLogger(__name__)


# TODO: Do we want to enforce this datetime for temporal coverage?
# Example values on their current portal range from "January 1, 2019 - December 31, 2019" to "2019 - 2021"
# There are also empty values as well as " - ".
# def iso_datetime_range(value: Any, context: Context):
#    """
#    Validates that the value is a valid ISO 8601 datetime range.
#
#    e.g. "2007-03-01T13:00:00Z/2008-05-11T15:30:00Z"
#
#    If the value isn't a full ISO 8601 datetime range, but is a valid
#    YYYY-MM-DD range, it will be converted to a full ISO 8601 datetime range.
#    """
#    if not value:
#        return
#
#    if not isinstance(value, str):
#        log.error('Datetime range is not a string')
#        raise Invalid("Value must be a string")
#
#    try:
#        start, end = value.split("/")
#        datetime.datetime.strptime(start, "%Y-%m-%dT%H:%M:%SZ")
#        datetime.datetime.strptime(end, "%Y-%m-%dT%H:%M:%SZ")
#    except (ValueError, AttributeError) as e:
#        try:
#            start, end = value.split("/")
#            datetime.datetime.strptime(start, "%Y-%m-%d")
#            datetime.datetime.strptime(end, "%Y-%m-%d")
#            value = f"{start}T00:00:00Z/{end}T23:59:59Z"
#        except (ValueError, AttributeError) as e:
#            log.error(
#                f'Value must be a valid ISO 8601 datetime range: {e}'
#            )
#            raise Invalid(
#                "Value must be a valid ISO 8601 datetime range"
#            )
#
#    return value


def iso_language_code(value: Any, context: Context):
    """
    Check that the value is a valid ISO 639-1 language code.

    e.g. "en"
    """
    if not value:
        return

    if not isinstance(value, str):
        log.error("Language code is not a string")
        raise Invalid("Value must be a string")

    try:
        is_lang = pycountry.languages.get(alpha_2=value)

        if not is_lang:
            log.error(f"Value must be a valid ISO 639-1 language code: {is_lang}")
            raise Invalid("Value must be a valid ISO 639-1 language code")
    except Exception as e:
        log.error(f"Value must be a valid ISO 639-1 language code: {e}")
        raise Invalid("Value must be a valid ISO 639-1 language code")

    return value


def year_validator(value: Any, context: Context):
    """
    Check that the value is a valid year.

    e.g. "2020"
    """
    if not value:
        return

    try:
        value = int(value)
    except ValueError as e:
        log.error(f"Value must be a valid 4-digit year: {e}")
        raise Invalid("Value must be a valid 4-digit year")

    if value < 0 or value > 3000:
        log.error(f"Value must be a valid 4-digit year: {value}")
        raise Invalid("Value must be a valid 4-digit year")

    return value


def mutually_exclusive(other_key: str) -> Validator:
    """Ensure that either current value or other field has value, but not both.

    .. code-block::

        data, errors = tk.navl_validate(
            {"sender_id": 1},
            {"sender_id": [mutually_exclusive("recipient_id")]}
        )
        assert errors == {"sender_id": [error_message]}

        data, errors = tk.navl_validate(
            {"recipient_id": 1},
            {"sender_id": [mutually_exclusive("recipient_id")]}
        )
        assert errors == {"sender_id": [error_message]}

        data, errors = tk.navl_validate(
            {"sender_id": 1, "recipient_id": 2},
            {"sender_id": [mutually_exclusive("recipient_id")]}
        )
        assert errors == {"sender_id": [error_message]}

        data, errors = tk.navl_validate(
            {"sender_id": 1, "recipient_id": []},
            {"sender_id": [mutually_exclusive("recipient_id")]}
        )
        assert not errors

    """

    def callable(
        key: FlattenKey,
        data: FlattenDataDict,
        errors: FlattenErrorDict,
        context: Context,
    ):
        value = data.get(key)
        other_value = data.get(key[:-1] + (other_key,))

        if (value and not other_value) or (other_value and not value):
            # Either current value or other field should have a value, but not both
            return

        errors[key].append(
            _("Either {0} or {1} should be present, not both.").format(
                key[-1], other_key
            )
        )
        raise StopOnError

    return callable


def _validate_agent(agent: dict, context: Context):
    """
    Confirms that the agent is a valid dictionary with only "name" and "email" keys.

    e.g.:
    {
      "name": "Joe Bloggs",
      "email": "joe.bloggs@example.com"
    }
    """
    required_keys = ["name", "email"]

    for key in agent.keys():
        if key not in required_keys:
            log.error(f'Unsupported key "{key}"')
            raise Invalid(f'Unsupported key "{key}"')

    for key in required_keys:
        if key not in agent:
            log.error(f'"{key}" is required')
            raise Invalid(f'"{key}" is required')

        if not isinstance(agent[key], str):
            log.error(f'"{key}" must be a string')
            raise Invalid(f'"{key}" must be a string')

        if key == "email":
            agent[key] = email_validator(agent[key], context)


def agents_json_object(value: Any, context: Context):
    """
    Confirms that the value is a valid JSON object (array of objects).
    Must contain an array of objects with only "name" and "email" keys.

    e.g.:
    [
      {
        "name": "Joe Bloggs",
        "email": "joe.bloggs@example.com"
      },
      {
        "name": "Example Organization (or Initiative)",
        "email": "contact@example.com"
      }
    ]
    """
    if not value:
        return

    loaded_value = value

    if isinstance(value, str):
        try:
            loaded_value = json.loads(value)
        except Exception as e:
            log.error(f"Value must be a valid JSON object: {e}")
            raise Invalid("Value must be a valid JSON object")
    elif isinstance(value, list):
        for agent in loaded_value:
            _validate_agent(agent, context)

    return value
