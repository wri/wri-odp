import datetime
from typing import Any
import pycountry
import logging

from ckan.types import Context
from ckan.plugins.toolkit import ValidationError
import ckan.lib.navl.dictization_functions as df

Invalid = df.Invalid

log = logging.getLogger(__name__)


# TODO: Do we want to enforce this datetime for temporal coverage?
# Example values on their current portal range from "January 1, 2019 - December 31, 2019" to "2019 - 2021"
# There are also empty values as well as " - ".
#def iso_datetime_range(value: Any, context: Context):
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
        log.error('Language code is not a string')
        raise Invalid("Value must be a string")

    try:
        is_lang = pycountry.languages.get(alpha_2=value)

        if not is_lang:
            log.error(
                f'Value must be a valid ISO 639-1 language code: {is_lang}'
            )
            raise Invalid(
                "Value must be a valid ISO 639-1 language code"
            )
    except Exception as e:
        log.error(f'Value must be a valid ISO 639-1 language code: {e}')
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
        log.error(f'Value must be a valid 4-digit year: {e}')
        raise Invalid("Value must be a valid 4-digit year")

    if value < 0 or value > 3000:
        log.error(f'Value must be a valid 4-digit year: {value}')
        raise Invalid("Value must be a valid 4-digit year")

    return value
