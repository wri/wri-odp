import datetime
from typing import Any
import pycountry
import logging
import json
import re
from urllib.parse import urlparse
import string

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


def _validate_agents_list(value: Any, context: Context, field_name: str = "agent"):
    if not value:
        raise Invalid(f"At least one {field_name} is required")

    loaded_value = value

    if isinstance(value, str):
        try:
            loaded_value = json.loads(value)
        except Exception as e:
            log.error(f"Value must be a valid JSON object: {e}")
            raise Invalid("Value must be a valid JSON object")
    
    if not isinstance(loaded_value, list):
        raise Invalid(f"Value must be a JSON array of {field_name} objects")

    if len(loaded_value) == 0:
        raise Invalid(f"At least one {field_name} is required")

    for agent in loaded_value:
        _validate_agent(agent, context)

    return value


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


def _url_validator(value: str) -> bool:
    """Checks that the provided value is a valid URL"""
    try:
        pieces = urlparse(value)
        if all([pieces.scheme, pieces.netloc]) and pieces.scheme in [
            "http",
            "https",
        ]:
            hostname, port = (
                pieces.netloc.split(":")
                if ":" in pieces.netloc
                else (pieces.netloc, None)
            )
            if set(hostname) <= set(string.ascii_letters + string.digits + "-.") and (
                port is None or port.isdigit()
            ):
                return True
    except ValueError:
        # url is invalid
        pass
    return False


# pattern from https://html.spec.whatwg.org/#e-mail-state-(type=email)
email_pattern = re.compile(
    # additional pattern to reject malformed dots usage
    r"^(?!\.)(?!.*\.$)(?!.*?\.\.)"
    r"[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9]"
    r"(?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9]"
    r"(?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
)


def _email_validator(value: str) -> bool:
    """Check that the value is a valid email address."""
    if 'mailto:' in value:
        value = value.split('mailto:')[1]
        return bool(email_pattern.match(value))
    else:
        return False


def url_or_email_validator(value: Any, context: Context):
    """
    Check that the value is a valid URL or email address.

    e.g. "http://example.com" or "example.user@example.com"
    """
    if not value:
        return

    if not isinstance(value, str):
        log.error("Value must be a string")
        raise Invalid("Value must be a string")

    if _email_validator(value) or _url_validator(value):
        return value

    raise Invalid(_("Invalid URL"))


def additional_reading_json_object(value: Any, context: Context):
    if not value:
        return

    loaded_value = value
    if isinstance(value, str):
        try:
            loaded_value = json.loads(value)
        except Exception:
            raise Invalid("additional_reading must be a valid JSON array")

    if not isinstance(loaded_value, list):
        raise Invalid("additional_reading must be a JSON array")

    for idx, item in enumerate(loaded_value):
        if not isinstance(item, dict):
            raise Invalid(f"additional_reading[{idx}] must be an object")

        url = item.get("url")
        if not isinstance(url, str) or not _url_validator(url):
            raise Invalid(
                f"additional_reading[{idx}].url must be a valid http:// or https:// URL"
            )

    return value



def resource_cross_fields(context: Context, data_dict: dict):
    """
    Validate resource-level cross-field rules consistent with frontend ResourceSchema:
      - link / tile-cache require url starting with http/https
      - gee-asset requires asset_type
      - tile-cache requires cache_type
    Raises toolkit.ValidationError with errors keyed into 'resources' (by index).
    """
    import ckan.plugins.toolkit as tk

    if data_dict.get("resources") is None:
        resources = [data_dict]
    else:
        resources = data_dict.get("resources") or []
    errors_for_resources = {}

    for i, r in enumerate(resources):
        # resource dicts may use 'url_type' or 'type'
        rtype = r.get("url_type") or r.get("type") or ""
        # require url for link and tile-cache and must be http(s)
        if rtype in ("link", "tile-cache"):
            url = r.get("url")
            if not url or not _url_validator(str(url)):
                errors_for_resources.setdefault(i, {})["url"] = "Invalid URL"

        # gee-asset requires asset_type
        if rtype == "gee-asset":
            if not r.get("asset_type"):
                errors_for_resources.setdefault(i, {})[
                    "asset_type"
                ] = "Required"

        # tile-cache requires cache_type
        if rtype == "tile-cache":
            if not r.get("cache_type"):
                errors_for_resources.setdefault(i, {})[
                    "cache_type"
                ] = "Required"

        # title must be at least 2 chars (frontend enforces this)
        title = r.get("title", r.get("name", None))
        if title is None or (isinstance(title, str) and len(title.strip()) < 2):
            errors_for_resources.setdefault(i, {})[
                "title"
            ] = "Title is required (minimum of 2 characters)"

    if errors_for_resources:
        raise tk.ValidationError({"resources": errors_for_resources})

    return True

def dataset_cross_fields(context: Context, data_dict: dict):
    """
    Enforce cross-field rules that are easier to validate at the action level:
      - owner_org (team) is required for all datasets
      - if rw_dataset: connectorType, provider required, and connectorUrl OR tableName required
      - if visibility_type == public: technical_notes required
    Raises ckan.plugins.toolkit.ValidationError on failure (so API returns sensible errors).
    """
    import ckan.plugins.toolkit as tk

    owner_org = data_dict.get("owner_org") or data_dict.get("team")
    if not owner_org:
        raise tk.ValidationError({"owner_org": "Team is required for all Datasets"})
    
    title = data_dict.get("title")
    if title is not None:
        if not isinstance(title, str) or len(title.strip()) < 2:
            raise tk.ValidationError({"title": "Title is required (minimum 2 characters)"})

    vis = data_dict.get("visibility_type", "public")
    vis_value = None
    if isinstance(vis, dict):
        vis_value = vis.get("value") or vis.get("label")
    else:
        vis_value = vis

    # technical_notes required for public datasets
    if vis_value == "public":
        if not data_dict.get("technical_notes"):
            raise tk.ValidationError({"technical_notes": "Technical notes are required for public Datasets"})

    authors = data_dict.get("authors")
    if authors:
        try:
            _validate_agents_list(authors, context, "author")
        except Invalid as e:
            raise tk.ValidationError({"authors": str(e)})
    
    maintainers = data_dict.get("maintainers", None)
    if maintainers is None:
        raise tk.ValidationError({"maintainers": "At least one maintainer is required"})
    try:
        _validate_agents_list(maintainers, context, "maintainer")
    except Invalid as e:
        raise tk.ValidationError({"maintainers": str(e)})

    # RW dataset rules
    if data_dict.get("rw_dataset"):
        connector_type = data_dict.get("connectorType")
        provider = data_dict.get("provider")
        connector_url = data_dict.get("connectorUrl")
        table_name = data_dict.get("tableName")

        if not connector_type:
            raise tk.ValidationError({"connectorType": "Connector Type is required for RW Datasets"})
        if not provider:
            raise tk.ValidationError({"provider": "Provider is required for RW Datasets"})
        if not connector_url and not table_name:
            raise tk.ValidationError({"connectorUrl": "ConnectorUrl is required for RW Datasets, unless a table name is provided"})
        
    resource_cross_fields(context, data_dict)

    return True

def title_validator(value, context):
    if value is None:
        return value
    if isinstance(value, str) and len(value.strip()) < 2:
        raise Invalid("Title is required (minimum of 2 characters)")
    return value