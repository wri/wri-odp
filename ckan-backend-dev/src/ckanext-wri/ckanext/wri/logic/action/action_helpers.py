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

                email_validator(email)

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
    except Exception as e:
        log.warn(f"Value is not a valid JSON object: {e}")
        return False


def stringify_actor_objects(data_dict: DataDict) -> DataDict:
    authors = data_dict.get("authors")
    maintainers = data_dict.get("maintainers")

    if authors:
        is_json = _is_json_string(authors)

        if isinstance(authors, list):
            data_dict["authors"] = json.dumps(authors)
        elif isinstance(authors, str) and not is_json:
            authors_processed = _process_actor_string(authors, "author")

            if authors_processed:
                data_dict["authors"] = json.dumps(authors_processed)

    if maintainers:
        is_json = _is_json_string(maintainers)

        if isinstance(maintainers, list):
            data_dict["maintainers"] = json.dumps(maintainers)
        elif isinstance(maintainers, str) and not is_json:
            maintainers_processed = _process_actor_string(maintainers, "maintainer")

            if maintainers_processed:
                data_dict["maintainers"] = json.dumps(maintainers_processed)

    return data_dict
