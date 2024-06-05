from typing_extensions import TypeAlias, Any
import logging
import requests
from urllib.parse import urljoin
import json

from ckanext.wri.model.notification import Notification, notification_dictize
from ckanext.wri.model.pending_datasets import PendingDatasets
from ckanext.wri.logic.auth import schema
from ckanext.wri.logic.action.send_group_notification import (
    GroupNotificationParams,
    send_group_notification,
)
import ckan.logic as logic

from ckan.common import _, config
import ckan.plugins.toolkit as tk
from ckan.types import Context, DataDict
import ckan.plugins as p
import ckan.lib.helpers as h
import ckan.logic as l

NotificationGetUserViewedActivity: TypeAlias = None
log = logging.getLogger(__name__)


# Most of SCHEMA_FIELDS and SCHEMA_SYNONYMS are not currently
# supported in Whitelist and Blacklist, but they might be later.
SCHEMA_FIELDS = [
    "author",
    "author_email",
    "isopen",
    "license_id",
    "license_title",
    "maintainer",
    "maintainer_email",
    "notes",
    "organization",
    "title",
    "url",
    "resources",
    "extras",
    "language",
    "citation",
    "cautions",
    "spatial",
    "spatial_address",
    "update_frequency",
    "temporal_coverage_start",
    "temporal_coverage_end",
    "featured_dataset",
    "groups",
    "project",
    "function",
    "methodology",
    "open_in",
    "release_notes",
    "restrictions",
    "reason_for_adding",
    "short_description",
    "learn_more",
    "wri_data",
    "technical_notes",
    "visibility_type",
    "approval_status",
    "is_approved",
]

SCHEMA_SYNONYMS = {
    "organization": "owner_org",
    "team": "owner_org",
    "owner_org": "owner_org",
    "groups": "groups",
    "group": "groups",
    "topics": "groups",
    "topic": "groups",
    "resources": "resources",
    "resource": "resources",
    "layers": "resources",
    "layer": "resources",
}

TRIGGER_MIGRATION_PARAMS = [
    "is_bulk",
    "file_name",
    "whitelist",
    "blacklist",
]

MIGRATE_DATASET_PARAMS = [
    "id",
    "gfw_dataset",
    "gfw_only",
    "gfw_version",
    "application",
    "team",
    "topics",
    "layer_ids",
    "maintainer",
    "maintainer_email",
    "geographic_coverage",
    "whitelist",
    "blacklist",
]


def _trigger_prefect_flow(data_dict: DataDict) -> dict[str, Any]:
    prefect_url = config.get("ckanext.wri.prefect_url")
    migration_flow_name = config.get("ckanext.wri.migration_flow_name")
    deployment_name = config.get("ckanext.wri.migration_deployment_name")
    deployment_env = config.get("ckanext.wri.migration_deployment_env")

    if any(
        [
            not prefect_url,
            not migration_flow_name,
            not deployment_name,
        ]
    ):
        error: dict[str, Any] = {
            "message": "Prefect Configuration Error",
            "details": "prefect_url, migration_flow_name, and migration_deployment_name are required",
        }
        raise p.toolkit.ValidationError(error)

    try:
        deployment = requests.get(
            urljoin(
                prefect_url,
                f"/api/deployments/name/{migration_flow_name}/{deployment_name}_{deployment_env}",
            )
        )
        deployment = deployment.json()
        deployment_id = deployment["id"]

        r = requests.post(
            urljoin(prefect_url, f"api/deployments/{deployment_id}/create_flow_run"),
            headers={"Content-Type": "application/json"},
            data=json.dumps(
                {
                    "parameters": {
                        "data_dict": data_dict,
                    },
                    "state": {"type": "SCHEDULED", "state_details": {}},
                }
            ),
        )
        return r.json()
    except requests.exceptions.ConnectionError as e:
        error: dict[str, Any] = {
            "message": "Request Failed",
            "details": str(e),
        }
        raise p.toolkit.ValidationError(error)


def notification_create(
    context: Context, data_dict: DataDict
) -> NotificationGetUserViewedActivity:
    """Create a Notification by providing Sender and Recipient"""

    model = context["model"]
    session = context["session"]
    user_obj = model.User.get(context["user"])

    # tk.check_access("notification_create", context, data_dict)
    sch = context.get("schema") or schema.default_create_notification_schema()
    data, errors = tk.navl_validate(data_dict, sch, context)
    if errors:
        raise tk.ValidationError(errors)

    recipient_id = data_dict.get("recipient_id")
    sender_id = data_dict.get("sender_id")
    activity_type = data_dict.get("activity_type")
    object_type = data_dict.get("object_type")
    object_id = data_dict.get("object_id")

    user_notifications = Notification(
        recipient_id=recipient_id,
        sender_id=sender_id if sender_id else '',
        activity_type=activity_type,
        object_type=object_type,
        object_id=object_id,
    )

    session.add(user_notifications)

    if not context.get("defer_commit"):
        model.repo.commit()

    notification_dicts = notification_dictize(user_notifications, context)
    return notification_dicts


def pending_dataset_create(context: Context, data_dict: DataDict):
    """Create a Pending Dataset"""
    package_id = data_dict.get("package_id")
    package_data = data_dict.get("package_data")

    if not package_id:
        raise tk.ValidationError(_("package_id is required"))

    if not package_data:
        raise tk.ValidationError(_("package_data is required"))

    # tk.check_access("package_update", context, package_data)

    pending_dataset = None

    try:
        pending_dataset = PendingDatasets.create(package_id, package_data)
    except Exception as _e:
        log.error(_e)
        try:
            pending_dataset = PendingDatasets.get(package_id)
        except Exception as e:
            raise tk.ValidationError(_e)

    if not pending_dataset:
        raise tk.ValidationError(_(f"Pending Dataset not found: {package_id}"))

    return pending_dataset


@logic.side_effect_free
def trigger_migration(context: Context, data_dict: DataDict):
    if not logic.check_access("sysadmin", context=context):
        raise tk.NotAuthorized(_("Only sysadmins can trigger migrations"))

    data_dict["is_bulk"] = True

    data_dict = _black_white_list("whitelist", data_dict)
    data_dict = _black_white_list("blacklist", data_dict)

    if data_dict.get("whitelist") and data_dict.get("blacklist"):
        raise tk.ValidationError(_("Whitelist and blacklist cannot be used together"))

    invalid_params = set(data_dict.keys()) - set(TRIGGER_MIGRATION_PARAMS)

    if invalid_params:
        raise tk.ValidationError(_(f"Invalid parameters: {', '.join(invalid_params)}"))

    return _trigger_prefect_flow(data_dict)


@logic.side_effect_free
def migrate_dataset(context: Context, data_dict: DataDict):
    dataset_id = data_dict.get("id")
    application = data_dict.get("application")
    gfw_dataset = data_dict.get("gfw_dataset")

    data_dict = _black_white_list("whitelist", data_dict)
    data_dict = _black_white_list("blacklist", data_dict)

    if data_dict.get("whitelist") and data_dict.get("blacklist"):
        raise tk.ValidationError(_("Whitelist and blacklist cannot be used together"))

    if not dataset_id:
        if not gfw_dataset:
            raise tk.ValidationError(_("Dataset 'id' or 'gfw_dataset' is required"))
        else:
            data_dict["gfw_only"] = True

    if not application:
        if not gfw_dataset:
            raise tk.ValidationError(_("Application is required"))

    team = data_dict.get("team")
    topics = data_dict.get("topics")

    tk.check_access("package_create", context, data_dict)

    if team:
        try:
            team_dict = tk.get_action("organization_show")(
                context, {"id": team, "include_users": True}
            )
            tk.check_access("organization_update", context, team_dict)
        except logic.NotFound:
            raise tk.ValidationError(_(f"Team '{team}' not found"))

    if topics:
        if isinstance(topics, str):
            topics = topics.split(",")

            for topic in topics:
                try:
                    topic_dict = tk.get_action("group_show")(
                        context, {"id": topic, "include_users": True}
                    )
                    tk.check_access("group_update", context, topic_dict)

                    data_dict["topics"] = topics
                except logic.NotFound:
                    raise tk.ValidationError(_(f"Topic '{topic}' not found"))

        else:
            raise tk.ValidationError(
                _(
                    "Topics must be a string (comma separated if it contains multiple topics)"
                )
            )

    invalid_params = set(data_dict.keys()) - set(MIGRATE_DATASET_PARAMS)

    if invalid_params:
        raise tk.ValidationError(_(f"Invalid parameters: {', '.join(invalid_params)}"))

    return _trigger_prefect_flow(data_dict)


def _black_white_list(list_type: str, data_dict: DataDict):
    list_fields = data_dict.get(list_type)

    if list_fields:
        if isinstance(list_fields, str):
            list_fields = list_fields.split(",")

            for field in list_fields:
                if field in [
                    "owner_org",
                    "organization",
                    "orgainzations",
                    "team",
                    "teams",
                    "groups",
                    "group",
                    "topics",
                    "topic",
                ]:
                    raise tk.ValidationError(
                        _(
                            f"{list_type.capitalize()} field '{field}' is not supported in {list_type.capitalize()} list"
                        )
                    )
                if field not in SCHEMA_FIELDS:
                    raise tk.ValidationError(
                        _(
                            f"{list_type.capitalize()} field '{field}' is not a valid field"
                        )
                    )

            data_dict[list_type] = [
                SCHEMA_SYNONYMS.get(field, field) for field in list_fields
            ]
        else:
            raise tk.ValidationError(
                _(f"{list_type.capitalize()} fields must be a comma-separated string")
            )

    return data_dict


@logic.side_effect_free
def migration_status(context: Context, data_dict: DataDict):
    prefect_url = config.get("ckanext.wri.prefect_url")
    flow_run_id = data_dict.get("id")

    if not flow_run_id:
        raise tk.ValidationError(_("'id' is required"))

    if not prefect_url:
        error: dict[str, Any] = {
            "message": "Prefect Configuration Error",
            "details": "Prefect URL is required",
        }
        raise p.toolkit.ValidationError(error)

    try:
        flow_run = requests.get(urljoin(prefect_url, f"/api/flow_runs/{flow_run_id}"))
        return flow_run.json()
    except requests.exceptions.ConnectionError as e:
        error: dict[str, Any] = {
            "message": "Request Failed",
            "details": str(e),
        }
        raise p.toolkit.ValidationError(error)


def package_create(context: Context, data_dict: DataDict):
    data_dict["is_pending"] = True
    data_dict["is_approved"] = False
    data_dict["approval_status"] = "pending"
    dataset = l.action.create.package_create(context, data_dict)
    if data_dict.get("owner_org"):
        org = tk.get_action("organization_show")(
            context, {"id": data_dict.get("owner_org")}
        )
        custom_org = {
            "id": org.get("id"),
            "name": org.get("name"),
            "title": org.get("title"),
            "description": org.get("description"),
            "image_url": org.get("image_url"),
            "created": org.get("created"),
            "approval_status": org.get("approval_status"),
            "is_organization": org.get("is_organization"),
            "state": org.get("state"),
            "type": org.get("type"),
        }
        dataset["organization"] = custom_org
    pending_dataset = tk.get_action("pending_dataset_create")(
        {"ignore_auth": True},
        {"package_id": dataset.get("id"), "package_data": dataset},
    )
    if (
        dataset.get("visibility_type") != "private"
        and dataset.get("visibility_type") != "draft"
    ):
        send_group_notification(
            context,
            {
                "owner_org": dataset.get("owner_org"),
                "creator_id": dataset.get("creator_user_id"),
                "collaborator_id": [],
                "dataset_id": dataset["id"],
                "action": "pending_dataset",
            },
        )
    if (
        dataset.get("visibility_type") == "private"
        or dataset.get("visibility_type") == "draft"
    ):
        tk.get_action("approve_pending_dataset")(
            context, {"dataset_id": dataset.get("id")}
        )

    if (dataset.get("visibility_type") == "internal"):
        print("INTERNAL PENDING DATASET")

        __import__('pprint').pprint(pending_dataset)
    return dataset
