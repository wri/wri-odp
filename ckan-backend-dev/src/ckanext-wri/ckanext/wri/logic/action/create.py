from typing_extensions import TypeAlias, Any
import logging
import requests
from urllib.parse import urljoin
import json
from typing import Any, Union, cast
import six

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
from ckan.types import Context, DataDict, ErrorDict, Schema
import ckan.plugins as p
import ckan.lib.helpers as h
import ckan.logic as l
from ckan.types.logic import ActionResult
import ckan.plugins as plugins
import ckan.lib.uploader as uploader
import ckan.lib.plugins as lib_plugins
import ckan.lib.dictization.model_save as model_save

from ckanext.wri.logic.action.action_helpers import stringify_actor_objects

NotificationGetUserViewedActivity: TypeAlias = None
log = logging.getLogger(__name__)


_check_access = logic.check_access
_get_action = logic.get_action
ValidationError = logic.ValidationError
NotFound = logic.NotFound
NotAuthorized = logic.NotAuthorized
_get_or_bust = logic.get_or_bust
fresh_context = logic.fresh_context


# Most of SCHEMA_FIELDS and SCHEMA_SYNONYMS are not currently
# supported in Whitelist and Blacklist, but they might be later.
SCHEMA_FIELDS = [
    "authors",
    "isopen",
    "license_id",
    "license_title",
    "maintainers",
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
    "rw_dataset_id",
    "gfw_dataset",
    "gfw_only",
    "gfw_version",
    "application",
    "team",
    "topics",
    "layer_ids",
    "maintainers",
    "authors",
    "geographic_coverage",
    "whitelist",
    "blacklist",
    "dataset_slug",
    "dataset_title",
    "is_private",
    "is_approved",
    "approval_status",
    "visibility_type",
    "is_draft",
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
        print(migration_flow_name, flush=True)
        print(deployment_name, flush=True)
        print(deployment_env, flush=True)
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
    dataset_id = data_dict.get("rw_dataset_id")
    application = data_dict.get("application")
    gfw_dataset = data_dict.get("gfw_dataset")

    data_dict = _black_white_list("whitelist", data_dict)
    data_dict = _black_white_list("blacklist", data_dict)

    if data_dict.get("whitelist") and data_dict.get("blacklist"):
        raise tk.ValidationError(_("Whitelist and blacklist cannot be used together"))

    if not dataset_id:
        if not gfw_dataset:
            raise tk.ValidationError(_("Dataset 'rw_dataset_id' or 'gfw_dataset' is required"))
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

    data_dict = stringify_actor_objects(data_dict)

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


# IMPORTANT: This function includes an override/change for authors/maintainers (the call to stringify_actor_objects).
# This is not a 1:1 match with the original function, though all other logic is the same.
def old_package_create(context: Context, data_dict: DataDict) -> ActionResult.PackageCreate:
    """Create a new dataset (package).

    You must be authorized to create new datasets. If you specify any groups
    for the new dataset, you must also be authorized to edit these groups.

    Plugins may change the parameters of this function depending on the value
    of the ``type`` parameter, see the
    :py:class:`~ckan.plugins.interfaces.IDatasetForm` plugin interface.

    :param name: the name of the new dataset, must be between 2 and 100
        characters long and contain only lowercase alphanumeric characters,
        ``-`` and ``_``, e.g. ``'warandpeace'``
    :type name: string
    :param title: the title of the dataset (optional, default: same as
        ``name``)
    :type title: string
    :param private: If ``True`` creates a private dataset
    :type private: bool
    :param author: the name of the dataset's author (optional)
    :type author: string
    :param author_email: the email address of the dataset's author (optional)
    :type author_email: string
    :param maintainer: the name of the dataset's maintainer (optional)
    :type maintainer: string
    :param maintainer_email: the email address of the dataset's maintainer
        (optional)
    :type maintainer_email: string
    :param license_id: the id of the dataset's license, see
        :py:func:`~ckan.logic.action.get.license_list` for available values
        (optional)
    :type license_id: license id string
    :param notes: a description of the dataset (optional)
    :type notes: string
    :param url: a URL for the dataset's source (optional)
    :type url: string
    :param version: (optional)
    :type version: string, no longer than 100 characters
    :param state: the current state of the dataset, e.g. ``'active'`` or
        ``'deleted'``, only active datasets show up in search results and
        other lists of datasets, this parameter will be ignored if you are not
        authorized to change the state of the dataset (optional, default:
        ``'active'``)
    :type state: string
    :param type: the type of the dataset (optional),
        :py:class:`~ckan.plugins.interfaces.IDatasetForm` plugins
        associate themselves with different dataset types and provide custom
        dataset handling behaviour for these types
    :type type: string
    :param resources: the dataset's resources, see
        :py:func:`resource_create` for the format of resource dictionaries
        (optional)
    :type resources: list of resource dictionaries
    :param tags: the dataset's tags, see :py:func:`tag_create` for the format
        of tag dictionaries (optional)
    :type tags: list of tag dictionaries
    :param extras: the dataset's extras (optional), extras are arbitrary
        (key: value) metadata items that can be added to datasets, each extra
        dictionary should have keys ``'key'`` (a string), ``'value'`` (a
        string)
    :type extras: list of dataset extra dictionaries
    :param plugin_data: private package data belonging to plugins.
        Only sysadmin users may set this value. It should be a dict that can
        be dumped into JSON, and plugins should namespace their data with the
        plugin name to avoid collisions with other plugins, eg::

            {
                "name": "test-dataset",
                "plugin_data": {
                    "plugin1": {"key1": "value1"},
                    "plugin2": {"key2": "value2"}
                }
            }
    :type plugin_data: dict
    :param relationships_as_object: see :py:func:`package_relationship_create`
        for the format of relationship dictionaries (optional)
    :type relationships_as_object: list of relationship dictionaries
    :param relationships_as_subject: see :py:func:`package_relationship_create`
        for the format of relationship dictionaries (optional)
    :type relationships_as_subject: list of relationship dictionaries
    :param groups: the groups to which the dataset belongs (optional), each
        group dictionary should have one or more of the following keys which
        identify an existing group:
        ``'id'`` (the id of the group, string), or ``'name'`` (the name of the
        group, string),  to see which groups exist
        call :py:func:`~ckan.logic.action.get.group_list`
    :type groups: list of dictionaries
    :param owner_org: the id of the dataset's owning organization, see
        :py:func:`~ckan.logic.action.get.organization_list` or
        :py:func:`~ckan.logic.action.get.organization_list_for_user` for
        available values. This parameter can be made optional if the config
        option :ref:`ckan.auth.create_unowned_dataset` is set to ``True``.
    :type owner_org: string

    :returns: the newly created dataset (unless 'return_id_only' is set to True
              in the context, in which case just the dataset id will
              be returned)
    :rtype: dictionary

    """
    model = context["model"]
    user = context["user"]

    # Override for authors/maintainers validation/formatting
    data_dict = stringify_actor_objects(data_dict)

    if "type" not in data_dict:
        package_plugin = lib_plugins.lookup_package_plugin()
        try:
            # use first type as default if user didn't provide type
            package_type = package_plugin.package_types()[0]
        except (AttributeError, IndexError):
            package_type = "dataset"
            # in case a 'dataset' plugin was registered w/o fallback
            package_plugin = lib_plugins.lookup_package_plugin(package_type)
        data_dict["type"] = package_type
    else:
        package_plugin = lib_plugins.lookup_package_plugin(data_dict["type"])

    schema: Schema = context.get("schema") or package_plugin.create_package_schema()

    _check_access("package_create", context, data_dict)

    if "api_version" not in context:
        # check_data_dict() is deprecated. If the package_plugin has a
        # check_data_dict() we'll call it, if it doesn't have the method we'll
        # do nothing.
        check_data_dict = getattr(package_plugin, "check_data_dict", None)
        if check_data_dict:
            try:
                check_data_dict(data_dict, schema)
            except TypeError:
                # Old plugins do not support passing the schema so we need
                # to ensure they still work
                package_plugin.check_data_dict(data_dict)

    data, errors = lib_plugins.plugin_validate(
        package_plugin, context, data_dict, schema, "package_create"
    )
    log.debug(
        "package_create validate_errs=%r user=%s package=%s data=%r",
        errors,
        context.get("user"),
        data.get("name"),
        data_dict,
    )

    if errors:
        model.Session.rollback()
        raise ValidationError(errors)

    plugin_data = data.get("plugin_data", False)
    include_plugin_data = False
    if user:
        user_obj = model.User.by_name(six.ensure_text(user))
        if user_obj:
            data["creator_user_id"] = user_obj.id
            include_plugin_data = user_obj.sysadmin and plugin_data

    pkg = model_save.package_dict_save(data, context, include_plugin_data)

    # Needed to let extensions know the package and resources ids
    model.Session.flush()
    data["id"] = pkg.id
    if data.get("resources"):
        for index, resource in enumerate(data["resources"]):
            resource["id"] = pkg.resources[index].id

    context_org_update = context.copy()
    context_org_update["ignore_auth"] = True
    context_org_update["defer_commit"] = True
    _get_action("package_owner_org_update")(
        context_org_update, {"id": pkg.id, "organization_id": pkg.owner_org}
    )

    for item in plugins.PluginImplementations(plugins.IPackageController):
        item.create(pkg)

        item.after_dataset_create(context, data)

    # Make sure that a user provided schema is not used in create_views
    # and on package_show
    context.pop("schema", None)

    # Create default views for resources if necessary
    if data.get("resources"):
        logic.get_action("package_create_default_resource_views")(
            {"model": context["model"], "user": context["user"], "ignore_auth": True},
            {"package": data},
        )

    if not context.get("defer_commit"):
        model.repo.commit()

    return_id_only = context.get("return_id_only", False)

    if return_id_only:
        return pkg.id

    return _get_action("package_show")(
        context.copy(), {"id": pkg.id, "include_plugin_data": include_plugin_data}
    )


# IMPORTANT: This function includes an override/change for authors/maintainers (using old_package_update instead of package_update).
# This is not a 1:1 match with the original function, though all other logic is the same.
def resource_create(
    context: Context, data_dict: DataDict
) -> ActionResult.ResourceCreate:
    """Appends a new resource to a datasets list of resources.

    :param package_id: id of package that the resource should be added to.

    :type package_id: string
    :param url: url of resource
    :type url: string
    :param description: (optional)
    :type description: string
    :param format: (optional)
    :type format: string
    :param hash: (optional)
    :type hash: string
    :param name: (optional)
    :type name: string
    :param resource_type: (optional)
    :type resource_type: string
    :param mimetype: (optional)
    :type mimetype: string
    :param mimetype_inner: (optional)
    :type mimetype_inner: string
    :param cache_url: (optional)
    :type cache_url: string
    :param size: (optional)
    :type size: int
    :param created: (optional)
    :type created: iso date string
    :param last_modified: (optional)
    :type last_modified: iso date string
    :param cache_last_updated: (optional)
    :type cache_last_updated: iso date string
    :param upload: (optional)
    :type upload: FieldStorage (optional) needs multipart/form-data

    :returns: the newly created resource
    :rtype: dictionary

    """
    model = context["model"]

    package_id = _get_or_bust(data_dict, "package_id")
    if not data_dict.get("url"):
        data_dict["url"] = ""

    package_show_context: Union[Context, Any] = dict(context, for_update=True)
    pkg_dict = _get_action("package_show")(package_show_context, {"id": package_id})

    _check_access("resource_create", context, data_dict)

    for plugin in plugins.PluginImplementations(plugins.IResourceController):
        plugin.before_resource_create(context, data_dict)

    if "resources" not in pkg_dict:
        pkg_dict["resources"] = []

    upload = uploader.get_resource_uploader(data_dict)

    if "mimetype" not in data_dict:
        if hasattr(upload, "mimetype"):
            data_dict["mimetype"] = upload.mimetype

    if "size" not in data_dict:
        if hasattr(upload, "filesize"):
            data_dict["size"] = upload.filesize

    pkg_dict["resources"].append(data_dict)

    try:
        context["defer_commit"] = True
        context["use_cache"] = False
        # Override for authors/maintainers validation/formatting
        _get_action("old_package_update")(context, pkg_dict)
        context.pop("defer_commit")
    except ValidationError as e:
        try:
            error_dict = cast("list[ErrorDict]", e.error_dict["resources"])[-1]
        except (KeyError, IndexError):
            error_dict = e.error_dict
        raise ValidationError(error_dict)

    # Get out resource_id resource from model as it will not appear in
    # package_show until after commit
    package = context["package"]
    assert package
    upload.upload(package.resources[-1].id, uploader.get_max_resource_size())

    model.repo.commit()

    #  Run package show again to get out actual last_resource
    updated_pkg_dict = _get_action("package_show")(context, {"id": package_id})
    resource = updated_pkg_dict["resources"][-1]

    #  Add the default views to the new resource
    logic.get_action("resource_create_default_resource_views")(
        {"model": context["model"], "user": context["user"], "ignore_auth": True},
        {"resource": resource, "package": updated_pkg_dict},
    )

    for plugin in plugins.PluginImplementations(plugins.IResourceController):
        plugin.after_resource_create(context, resource)

    return resource
