import json
import logging

from ckan.types import DataDict
from ckan.logic.validators import email_validator


log = logging.getLogger(__name__)


def _process_actor_string(actor_string: str, actor_type: str) -> dict:
    actor_list = []
    invalid_actor_string_msg = f"Invalid {actor_type} string: "

    if actor_string:
        actor_items = actor_string.split(";") if ";" in actor_string else [actor_string]

        for item in actor_items:
            if ":" in item:
                if item.count(":") > 1:
                    raise ValueError(
                        f"{invalid_actor_string_msg}{actor_string}\nToo many colons in {actor_type} string. Expected format: 'name:email'"
                    )

                name, email = item.split(":")
                name = name.strip()
                email = email.strip()

                if not name or not email:
                    raise ValueError(
                        f"{invalid_actor_string_msg}{actor_string}\nEmpty name or email in {actor_type} string"
                    )

                email_validator(email, {})

                actor_list.append({"name": name, "email": email})
            else:
                raise ValueError(
                    f"{invalid_actor_string_msg}{actor_string}\nNo colon in {actor_type} string. Expected format: 'name:email'"
                )

    return actor_list


def _is_json_string(actors: str) -> bool:
    try:
        json.loads(actors)
        return True
    except json.JSONDecodeError as e:
        log.warning(f"Value is not a valid JSON object: {e}")
        return False
    except Exception as e:
        log.error(f"Error checking if value is a valid JSON object: {e}")
        return False


def _check_type(actors: str, data_dict: DataDict, actor_type: str) -> DataDict:
    is_json = _is_json_string(actors)

    if isinstance(actors, list):
        data_dict[actor_type] = json.dumps(actors)
    elif isinstance(actors, str) and not is_json:
        actors_processed = _process_actor_string(actors, actor_type)

        if actors_processed:
            data_dict[actor_type] = json.dumps(actors_processed)

    return data_dict


def stringify_actor_objects(data_dict: DataDict) -> DataDict:
    for key in ["authors", "maintainers"]:
        actors = data_dict.get(key)

        if actors:
            if all([k in actors for k in ["'name'", "'email'"]]):
                log.error(
                    f"{key} - Value must be a valid JSON object. Valid JSON uses double quotes, not single quotes: {actors}"
                )
                return data_dict

            data_dict = _check_type(actors, data_dict, key)

    return data_dict
