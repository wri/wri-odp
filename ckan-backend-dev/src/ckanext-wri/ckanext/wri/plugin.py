import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
import ckan.lib.plugins as lib_plugins
from typing import Any, Callable, cast
import ckanext.wri.logic.action as action
from ckanext.wri.logic.action.datapusher_download_subset import (
    subset_download_callback,
    subset_download_request,
)
from ckanext.wri.logic.action.datapusher_download_zip import (
    zipped_download_request,
    zipped_download_callback,
)
import ckanext.wri.logic.validators as wri_validators
from ckan import model, logic, authz
from ckan.types import Action, AuthFunction, Context
from ckan.lib.search import SearchError
from ckanext.wri.logic.auth import auth as auth
from ckanext.wri.logic.action.datapusher import (
    datapusher_latest_task,
    datapusher_submit,
)
from ckanext.wri.logic.action.create import (
    notification_create,
    pending_dataset_create,
    trigger_migration,
    migrate_dataset,
    migration_status,
    package_create,
)
from ckanext.wri.logic.action.update import (
    notification_update,
    pending_dataset_update,
    notification_bulk_update,
    issue_delete,
    approve_pending_dataset,
    package_patch,
    resource_update,
    old_package_patch,
    old_package_update,
)
from ckanext.wri.model.resource_location import ResourceLocation
from ckanext.wri.logic.action.get import (
    package_search,
    notification_get_all,
    pending_dataset_show,
    pending_diff_show,
    dataset_release_notes,
    dashboard_activity_listv2,
    package_activity_list_wri,
    organization_activity_list_wri,
    group_activity_list_wri,
    user_list_wri,
    organization_list_wri,
    group_list_wri,
    group_list_authz_wri,
    organization_list_for_user_wri,
    issue_search_wri,
    package_collaborator_list_wri,
    resource_search,
)

from ckanext.wri.logic.action.delete import pending_dataset_delete
from ckanext.wri.search import SolrSpatialFieldSearchBackend
from ckanext.wri.logic.action.action_helpers import stringify_actor_objects
from ckan.lib.navl.validators import ignore_missing
from ckanext.wri.logic.action.datapusher_download import (
    download_request,
    download_callback,
)
import ckanext.wri.views.api as api_blueprint
import ckanext.issues.logic.action as issue_action
import queue
import logging

log = logging.getLogger(__name__)


class WriPlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IConfigurable)
    plugins.implements(plugins.IValidators)
    plugins.implements(plugins.IFacets)
    plugins.implements(plugins.IClick)
    plugins.implements(plugins.IAuthFunctions)
    plugins.implements(plugins.IActions)
    plugins.implements(plugins.IPermissionLabels)
    plugins.implements(plugins.IPackageController, inherit=True)
    plugins.implements(plugins.IResourceView, inherit=True)
    plugins.implements(plugins.IResourceController, inherit=True)

    # over-write issue delete api
    issue_action.issue_delete = issue_delete

    # IConfigurer
    def configure(self, config):
        # Certain config options must exists for the plugin to work. Raise an
        # exception if they're missing.
        missing_config = "{0} is not configured. Please amend your .ini file."
        config_options = (
            "ckanext.wri.prefect_url",
            "ckanext.wri.datapusher_deployment_name",
        )
        for option in config_options:
            if not config.get(option, None):
                raise RuntimeError(missing_config.format(option))

    def update_config(self, config_):
        toolkit.add_template_directory(config_, "templates")
        toolkit.add_public_directory(config_, "public")
        toolkit.add_resource("assets", "wri")

    def get_commands(self):
        """CLI commands - Creates custom data tables"""
        import click

        @click.command()
        def notificationdb():
            """Creates notification data tables"""
            from ckanext.wri.model import setup

            setup()

        @click.command()
        def pendingdatasetsdb():
            """Creates pending datasets table"""
            from ckanext.wri.model import setup_pending_datasets

            setup_pending_datasets()

        @click.command()
        def resourcelocationdb():
            """Creates resources location table"""
            from ckanext.wri.model import setup_resource_location

            setup_resource_location()

        return [notificationdb, pendingdatasetsdb, resourcelocationdb]

    # IAuth

    def get_auth_functions(self) -> dict[str, AuthFunction]:
        return {
            "notification_get_all": auth.notification_get_all,
            "notification_create": auth.notification_create,
            "pending_dataset_create": auth.pending_dataset_create,
            "pending_dataset_show": auth.pending_dataset_show,
            "pending_dataset_update": auth.pending_dataset_update,
            "pending_dataset_delete": auth.pending_dataset_delete,
            "package_update": auth.package_update,
            "package_collaborator_list": auth.package_collaborator_list,
            "package_create": auth.package_create,
        }

    # IValidators

    def get_validators(self):
        return {
            "iso_language_code": wri_validators.iso_language_code,
            "year_validator": wri_validators.year_validator,
            "agents_json_object": wri_validators.agents_json_object
        }

    # IFacets

    def dataset_facets(self, facets_dict, package_type):
        facets_dict["language"] = toolkit._("Language")
        facets_dict["project"] = toolkit._("Project")
        facets_dict["application"] = toolkit._("Application")
        facets_dict["temporal_coverage_start"] = toolkit._("Temporal Coverage Start")
        facets_dict["temporal_coverage_end"] = toolkit._("Temporal Coverage End")
        facets_dict["update_frequency"] = toolkit._("Update Frequency")
        facets_dict["license_id"] = toolkit._("License")
        facets_dict["visibility_type"] = toolkit._("Visibility")
        facets_dict["featured_dataset"] = toolkit._("Featured Dataset")
        facets_dict["wri_data"] = toolkit._("WRI Data")
        return facets_dict

    def group_facets(self, facets_dict, group_type, package_type):
        return facets_dict

    def organization_facets(self, facets_dict, organization_type, package_type):
        return facets_dict

    # IActions

    def get_actions(self):
        return {
            "trigger_migration": trigger_migration,
            "migrate_dataset": migrate_dataset,
            "migration_status": migration_status,
            "package_search": package_search,
            "password_reset": action.password_reset,
            "notification_get_all": notification_get_all,
            "notification_create": notification_create,
            "notification_update": notification_update,
            "notification_bulk_update": notification_bulk_update,
            "pending_dataset_create": pending_dataset_create,
            "pending_dataset_show": pending_dataset_show,
            "pending_dataset_update": pending_dataset_update,
            "pending_dataset_delete": pending_dataset_delete,
            "pending_diff_show": pending_diff_show,
            "prefect_datapusher_submit": datapusher_submit,
            "prefect_latest_task": datapusher_latest_task,
            "prefect_download_from_store": download_request,
            "prefect_download_callback": download_callback,
            "dataset_release_notes": dataset_release_notes,
            "dashboard_activity_listv2": dashboard_activity_listv2,
            "package_activity_list_wri": package_activity_list_wri,
            "organization_activity_list_wri": organization_activity_list_wri,
            "group_activity_list_wri": group_activity_list_wri,
            "prefect_download_subset_from_store": subset_download_request,
            "prefect_download_subset_callback": subset_download_callback,
            "prefect_download_zipped": zipped_download_request,
            "prefect_download_zipped_callback": zipped_download_callback,
            "dataset_release_notes": dataset_release_notes,
            "user_list_wri": user_list_wri,
            "organization_list_wri": organization_list_wri,
            "group_list_wri": group_list_wri,
            "group_list_authz_wri": group_list_authz_wri,
            "organization_list_for_user_wri": organization_list_for_user_wri,
            "issue_search_wri": issue_search_wri,
            "package_collaborator_list_wri": package_collaborator_list_wri,
            "resource_location_search": resource_search,
            "approve_pending_dataset": approve_pending_dataset,
            "package_create": package_create,
            "old_package_create": logic.action.create.package_create,
            "package_patch": package_patch,
            "old_package_patch": old_package_patch,
            "old_package_update": old_package_update,
            "resource_update": resource_update,
            # "package_delete": package_delete,
        }

    # IPermissionLabels

    def get_dataset_labels(self, dataset_obj: model.Package) -> list[str]:
        visibility_type = dataset_obj.extras.get("visibility_type", "")

        is_draft = dataset_obj.extras.get("draft", False)
        is_draftTrue = is_draft == "true" or is_draft is True
        if (
            dataset_obj.state == "active"
            and visibility_type == "public"
            and not is_draftTrue
        ):
            return ["public"]

        if authz.check_config_permission("allow_dataset_collaborators"):
            # Add a generic label for all this dataset collaborators
            labels = ["collaborator-%s" % dataset_obj.id]
        else:
            labels = []

        if dataset_obj.owner_org and visibility_type in ["private"]:
            labels.append("member-%s" % dataset_obj.owner_org)
        elif visibility_type == "internal" and not is_draftTrue:
            labels.append("authenticated")
        elif (
            (visibility_type == "public" or visibility_type == "internal")
            and is_draftTrue
            and dataset_obj.owner_org
        ):
            labels.append("member-%s" % dataset_obj.owner_org)
        else:  # Draft
            labels.append("creator-%s" % dataset_obj.creator_user_id)

        return labels

    def get_user_dataset_labels(self, user_obj: model.User) -> list[str]:
        labels = ["public"]
        if not user_obj or user_obj.is_anonymous:
            return labels

        labels.append("authenticated")
        labels.append("creator-%s" % user_obj.id)

        orgs = logic.get_action("organization_list_for_user")(
            {"user": user_obj.id}, {"permission": "read"}
        )
        labels.extend("member-%s" % o["id"] for o in orgs)

        if authz.check_config_permission("allow_dataset_collaborators"):
            # Add a label for each dataset this user is a collaborator of
            datasets = logic.get_action("package_collaborator_list_for_user")(
                {"ignore_auth": True}, {"id": user_obj.id}
            )

            labels.extend("collaborator-%s" % d["package_id"] for d in datasets)

        return labels

    # IResourceController

    def after_resource_create(self, context: Context, resource_dict: dict[str, Any]):

        self._submit_to_datapusher(resource_dict)
        ResourceLocation.index_resource_by_location(
                        resource_dict, False
                    )

    def after_resource_update(self, context: Context, resource_dict: dict[str, Any]):

        self._submit_to_datapusher(resource_dict)
        ResourceLocation.index_resource_by_location(
                        resource_dict, False
                    )

    def _submit_to_datapusher(self, resource_dict: dict[str, Any]):
        context = cast(
            Context, {"model": model, "ignore_auth": True, "defer_commit": True}
        )

        resource_format = resource_dict.get("format")
        supported_formats = toolkit.config.get("ckan.datapusher.formats")

        submit = (
            resource_format
            and resource_format.lower() in supported_formats
            and resource_dict.get("url_type") != "datapusher"
            and resource_dict.get("url_type") == "upload"
        )

        if not submit:
            return

        try:
            log.debug(
                "Submitting resource {0}".format(resource_dict["id"]) + " to DataPusher"
            )
            toolkit.get_action("prefect_datapusher_submit")(
                context, {"resource_id": resource_dict["id"]}
            )
        except toolkit.ValidationError as e:
            # If datapusher is offline want to catch error instead
            # of raising otherwise resource save will fail with 500
            log.critical(e)
            pass

    # IPackageController

    def after_dataset_create(self, context, pkg_dict):
        if pkg_dict.get("resources") is not None:
            for resource in pkg_dict.get("resources"):
                self._submit_to_datapusher(resource)

        # if pkg_dict.get("is_approved", False):
        #     ResourceLocation.index_dataset_resources_by_location(pkg_dict, False)

    def after_dataset_update(self, context, pkg_dict):
        if pkg_dict.get("resources") is not None:
            for resource in pkg_dict.get("resources"):
                self._submit_to_datapusher(resource)  # TODO: uncomment

        # if pkg_dict.get("is_approved", False):
        #     ResourceLocation.index_dataset_resources_by_location(pkg_dict, False)

    def before_index(self, pkg_dict):
        return self.before_dataset_index(pkg_dict)

    def before_search(self, search_params):
        return self.before_dataset_search(search_params)

    def before_dataset_index(self, pkg_dict):
        if any(key in pkg_dict for key in ("authors", "maintainers")):
            pkg_dict = stringify_actor_objects(pkg_dict)

        if not pkg_dict.get("spatial"):
            return pkg_dict

        pkg_dict = SolrSpatialFieldSearchBackend().index_dataset(pkg_dict)

        # Coupled resources are URL -> uuid links, they are not needed in SOLR
        # and might be huge if there are lot of coupled resources
        pkg_dict.pop("coupled-resource", None)
        pkg_dict.pop("extras_coupled-resource", None)

        # spatial field is geojson coordinate data, not needed in SOLR either
        pkg_dict.pop("extras_spatial", None)
        pkg_dict.pop("spatial", None)

        return pkg_dict

    def before_dataset_search(self, search_params):
        input_point = search_params.get("extras", {}).get("ext_location_q", None)
        input_address = search_params.get("extras", {}).get("ext_address_q", None)
        _global = search_params.get("extras", {}).get("ext_global_q", None)

        point = []
        if input_point:
            point = input_point.split(",")

            if len(point) == 2:
                point = {"y": float(point[0]), "x": float(point[1])}
            else:
                raise SearchError("Wrong point provided")

        if point or input_address:
            search_params = SolrSpatialFieldSearchBackend().search_params(
                point, input_address, _global, search_params
            )

        return search_params

    # IResourceView

    def info(self):
        return {
            "name": "custom",
            "title": "Custom View",
            "always_available": True,
            "preview_enabled": False,
            "iframed": False,
            "schema": {"config_obj": [ignore_missing]},
        }

    def can_view(self):
        return True


class WriApiTracking(plugins.SingletonPlugin):
    plugins.implements(plugins.IBlueprint)
    plugins.implements(plugins.IConfigurable)

    analytics_queue = queue.Queue()

    # IBlueprint

    def get_blueprint(self):
        return [api_blueprint.wri]

    # IConfigurable

    def configure(self, config):
        self.wri_api_analytics_measurement_id = config.get(
            "ckanext.wri.api_analytics.measurement_id"
        )
        self.wri_api_analytics_api_secret = config.get(
            "ckanext.wri.api_analytics.api_secret"
        )

        variables = {
            "ckanext.wri.api_analytics.measurement_id": self.wri_api_analytics_measurement_id,
            "ckanext.wri.api_analytics.api_secret": self.wri_api_analytics_api_secret,
        }
        if not all(variables.values()):
            missing_variables = "\n".join([k for k, v in variables.items() if not v])
            msg = (
                f"The following variables are not configured:\n\n{missing_variables}\n"
            )
            raise RuntimeError(msg)

        # spawn a pool of 5 threads, and pass them queue instance
        for _ in range(5):
            t = api_blueprint.AnalyticsPostThread(self.analytics_queue)
            t.setDaemon(True)
            t.start()
