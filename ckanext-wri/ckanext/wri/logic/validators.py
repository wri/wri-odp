import datetime
from typing import Any
import pycountry
import logging

from ckan.types import Context
from ckan.plugins.toolkit import ValidationError

log = logging.getLogger(__name__)


def iso_datetime_range(value: Any, context: Context):
    """
    Validates that the value is a valid ISO 8601 datetime range.

    e.g. "2007-03-01T13:00:00Z/2008-05-11T15:30:00Z"

    If the value isn't a full ISO 8601 datetime range, but is a valid
    YYYY-MM-DD range, it will be converted to a full ISO 8601 datetime range.
    """
    if not isinstance(value, str):
        log.error('Datetime range is not a string')
        raise ValidationError("Value must be a string")

    try:
        start, end = value.split("/")
        datetime.datetime.strptime(start, "%Y-%m-%dT%H:%M:%SZ")
        datetime.datetime.strptime(end, "%Y-%m-%dT%H:%M:%SZ")
    except (ValueError, AttributeError) as e:
        try:
            start, end = value.split("/")
            datetime.datetime.strptime(start, "%Y-%m-%d")
            datetime.datetime.strptime(end, "%Y-%m-%d")
            value = f"{start}T00:00:00Z/{end}T23:59:59Z"
        except (ValueError, AttributeError) as e:
            log.error(
                f'Value must be a valid ISO 8601 datetime range: {e}'
            )
            raise ValidationError(
                "Value must be a valid ISO 8601 datetime range"
            )

    return value


def iso_language_code(value: Any, context: Context):
    """
    Check that the value is a valid ISO 639-1 language code.

    e.g. "en"
    """
    if not isinstance(value, str):
        log.error('Language code is not a string')
        raise ValidationError("Value must be a string")

    try:
        is_lang = pycountry.languages.get(alpha_2=value)

        if not is_lang:
            log.error(
                f'Value must be a valid ISO 639-1 language code: {is_lang}'
            )
            raise ValidationError(
                "Value must be a valid ISO 639-1 language code"
            )
    except Exception as e:
        log.error(f'Value must be a valid ISO 639-1 language code: {e}')
        raise ValidationError("Value must be a valid ISO 639-1 language code")

    return value
