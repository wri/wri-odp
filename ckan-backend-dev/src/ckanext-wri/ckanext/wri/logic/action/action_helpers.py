import json
import logging
from ckan.authz import users_role_for_group_or_org
import ckan.plugins.toolkit as tk
from ckan.common import _, config, current_user

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
    if isinstance(actors, list):
        data_dict[actor_type] = json.dumps(actors)
    elif isinstance(actors, str):
        actors = actors.strip()

        if (
            actors[0] == '"'
            and actors[-1] == '"'
            or actors[0] == "'"
            and actors[-1] == "'"
        ) and len(actors) > 1:
            actors = actors[1:-1]

        if _is_json_string(actors):
            data_dict[actor_type] = actors
        else:
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


def _fix_application_field(data_dict):
    """
    When "applications" field is provided, add dataset to the
    application
    """
    applications = data_dict.get("applications", None)

    if applications is not None and len(applications) > 0:
        application_names = [
            group.get("name") for group in data_dict.get("applications", [])
        ]
        priviliged_context = {"ignore_auth": True}

        group_list_action = tk.get_action("group_list")
        group_list_data_dict = {
            "type": "application",
            "groups": application_names,
            "include_extras": True,
            "all_fields": True,
        }
        group_list = group_list_action(priviliged_context, group_list_data_dict)

        application_groups = [
            {"name": x.get("name"), "type": "application"} for x in group_list
        ]
        groups = [
            {"name": x.get("name"), "type": "group"}
            for x in data_dict.get("groups", [])
        ]
        groups += application_groups
        data_dict["groups"] = groups
        data_dict["applications"] = [x.get("name") for x in group_list]
    return data_dict

def _fix_user_group_permission(data_dict):
    """
    By default, any user should be able to create datasets
    with any application or topic.
    To do that, add user as member of groups.
    """
    groups = data_dict.get("groups", [])
    if not hasattr(current_user, "id"):
        return
    user_id = current_user.name

    if len(groups) > 0 and user_id:
        priviliged_context = {"ignore_auth": True}
        group_member_create_action = tk.get_action("group_member_create")

        for group in groups:
            group_id = group.get("name")
            capacity = users_role_for_group_or_org(group_id, user_id)
            if capacity not in ["member", "editor", "admin"]:
                group_member_create_data_dict = {
                    "id": group.get("name"),
                    "username": user_id,
                    "role": "member",
                }
                group_member_create_action(
                    priviliged_context, group_member_create_data_dict
                )
    return data_dict


def _before_dataset_create_or_update(context, data_dict, is_update=False):
    _data_dict = _fix_application_field(data_dict)
    _data_dict = _fix_user_group_permission(_data_dict)
    return _data_dict
