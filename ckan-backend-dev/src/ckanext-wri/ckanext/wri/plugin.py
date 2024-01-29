import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
import ckan.lib.plugins as lib_plugins
from typing import Any, Callable, cast
import ckanext.wri.logic.action as action
import ckanext.wri.logic.validators as wri_validators
from ckan import model, logic, authz
from ckan.types import Action, AuthFunction, Context
from ckan.lib.search import SearchError
from ckanext.wri.logic.auth import auth as auth
<<<<<<< HEAD
from ckanext.wri.logic.action.datapusher import datapusher_latest_task, datapusher_submit
=======
>>>>>>> ef0e84a32055c12db8252223bc743e0b366d38ab
from ckanext.wri.logic.action.create import notification_create, pending_dataset_create
from ckanext.wri.logic.action.update import notification_update, pending_dataset_update
from ckanext.wri.logic.action.get import package_search, notification_get_all, pending_dataset_show, pending_diff_show
from ckanext.wri.logic.action.delete import pending_dataset_delete
from ckanext.wri.search import SolrSpatialFieldSearchBackend
from ckan.lib.navl.validators import ignore_missing

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

    # IConfigurer
    def configure(self, config):
        # Certain config options must exists for the plugin to work. Raise an
        # exception if they're missing.
        missing_config = "{0} is not configured. Please amend your .ini file."
        config_options = (
            'ckanext.wri.prefect_url',
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

        return [notificationdb, pendingdatasetsdb]

    # IAuth

    def get_auth_functions(self) -> dict[str, AuthFunction]:
        return {
            'notification_get_all': auth.notification_get_all,
            'notification_create': auth.notification_create,
            'pending_dataset_create': auth.pending_dataset_create,
            'pending_dataset_show': auth.pending_dataset_show,
            'pending_dataset_update': auth.pending_dataset_update,
            'pending_dataset_delete': auth.pending_dataset_delete,
        }

    # IValidators

    def get_validators(self):
        return {
            "iso_language_code": wri_validators.iso_language_code,
            "year_validator": wri_validators.year_validator
        }

    # IFacets

    def dataset_facets(self, facets_dict, package_type):
        facets_dict['language'] = toolkit._('Language')
        facets_dict['project'] = toolkit._('Project')
        facets_dict['application'] = toolkit._('Application')
        facets_dict['temporal_coverage_start'] = toolkit._('Temporal Coverage Start')
        facets_dict['temporal_coverage_end'] = toolkit._('Temporal Coverage End')
        facets_dict['update_frequency'] = toolkit._('Update Frequency')
        facets_dict['license_id'] = toolkit._('License')
        facets_dict['visibility_type'] = toolkit._('Visibility')
        facets_dict['featured_dataset'] = toolkit._('Featured Dataset')
        facets_dict['wri_data'] = toolkit._('WRI Data')
        return facets_dict

    def group_facets(self, facets_dict, group_type, package_type):
        return facets_dict

    def organization_facets(self, facets_dict, organization_type, package_type):
        return facets_dict

    # IActions

    def get_actions(self):
        return {
            'package_search': package_search,
            'password_reset': action.password_reset,
            'notification_get_all': notification_get_all,
            'notification_create': notification_create,
            'notification_update': notification_update,
            'pending_dataset_create': pending_dataset_create,
            'pending_dataset_show': pending_dataset_show,
            'pending_dataset_update': pending_dataset_update,
            'pending_dataset_delete': pending_dataset_delete,
            'pending_diff_show': pending_diff_show,
            'prefect_datapusher_submit': datapusher_submit,
            'prefect_latest_task': datapusher_latest_task,
        }

    # IPermissionLabels
    def get_dataset_labels(self, dataset_obj: model.Package) -> list[str]:
        visibility_type = dataset_obj.extras.get('visibility_type', '')
        
        is_draft = dataset_obj.extras.get('draft', False)
        is_draftTrue = is_draft == 'true' or is_draft is True
        if dataset_obj.state == u'active' and visibility_type == "public" and not is_draftTrue:
            return [u'public']

        if authz.check_config_permission('allow_dataset_collaborators'):
            # Add a generic label for all this dataset collaborators
            labels = [u'collaborator-%s' % dataset_obj.id]
        else:
            labels = []

        if dataset_obj.owner_org and visibility_type in ["private"]:
            labels.append(u'member-%s' % dataset_obj.owner_org)
        elif visibility_type == "internal" and not is_draftTrue:
            labels.append(u'authenticated')
        elif (visibility_type == "public" or visibility_type == "internal" ) and is_draftTrue and dataset_obj.owner_org:
             labels.append(u'member-%s' % dataset_obj.owner_org)
        else: # Draft
            labels.append(u'creator-%s' % dataset_obj.creator_user_id)

        return labels

    def get_user_dataset_labels(self, user_obj: model.User) -> list[str]:
        labels = [u'public']
        if not user_obj or user_obj.is_anonymous:
            return labels

        labels.append(u'authenticated')
        labels.append(u'creator-%s' % user_obj.id)

        orgs = logic.get_action(u'organization_list_for_user')(
            {u'user': user_obj.id}, {u'permission': u'read'})
        labels.extend(u'member-%s' % o[u'id'] for o in orgs)

        if authz.check_config_permission('allow_dataset_collaborators'):
            # Add a label for each dataset this user is a collaborator of
            datasets = logic.get_action('package_collaborator_list_for_user')(
                {'ignore_auth': True}, {'id': user_obj.id})

            labels.extend('collaborator-%s' % d['package_id'] for d in datasets)

        return labels

    # IResourceController

    def after_resource_create(
            self, context: Context, resource_dict: dict[str, Any]):

        self._submit_to_datapusher(resource_dict)

    def after_resource_update(
            self, context: Context, resource_dict: dict[str, Any]):

        self._submit_to_datapusher(resource_dict)

    def _submit_to_datapusher(self, resource_dict: dict[str, Any]):
        print("SUBMITTING TO DATAPUSHER")
        context = cast(Context, {
            u'model': model,
            u'ignore_auth': True,
            u'defer_commit': True
        })

        resource_format = resource_dict.get('format')
        supported_formats = toolkit.config.get(
            'ckan.datapusher.formats'
        )

        submit = (
            resource_format
            and resource_format.lower() in supported_formats
            and resource_dict.get('url_type') != u'datapusher'
        )

        if not submit:
            return

        try:
            log.debug(
                u'Submitting resource {0}'.format(resource_dict['id']) +
                u' to DataPusher'
            )
            toolkit.get_action(u'prefect_datapusher_submit')(
                context, {
                    u'resource_id': resource_dict['id']
                }
            )
        except toolkit.ValidationError as e:
            # If datapusher is offline want to catch error instead
            # of raising otherwise resource save will fail with 500
            log.critical(e)
            pass


    # IPackageController

    def after_dataset_create(self, context, pkg_dict):
        if pkg_dict.get('resources') is not None:
            for resource in pkg_dict.get('resources'):
                self._submit_to_datapusher(resource)

    def after_dataset_update(self, context, pkg_dict):
        if pkg_dict.get('resources') is not None:
            for resource in pkg_dict.get('resources'):
                self._submit_to_datapusher(resource)

    def before_index(self, pkg_dict):
        return self.before_dataset_index(pkg_dict)

    def before_search(self, search_params):
        return self.before_dataset_search(search_params)

    def before_dataset_index(self, pkg_dict):
        if not pkg_dict.get('spatial'):
            return pkg_dict

        pkg_dict = SolrSpatialFieldSearchBackend().index_dataset(pkg_dict)

        # Coupled resources are URL -> uuid links, they are not needed in SOLR
        # and might be huge if there are lot of coupled resources
        pkg_dict.pop('coupled-resource', None)
        pkg_dict.pop('extras_coupled-resource', None)

        # spatial field is geojson coordinate data, not needed in SOLR either
        pkg_dict.pop('extras_spatial', None)
        pkg_dict.pop('spatial', None)

        return pkg_dict

    def before_dataset_search(self, search_params):
        input_point = search_params.get('extras', {}).get('ext_location_q', None)
        input_address = search_params.get('extras', {}).get('ext_address_q', None)

        point = [] 
        if input_point:
            point = input_point.split(",")

            if len(point) == 2:
                point = { "y": float(point[0]), "x": float(point[1]) }
            else:
                raise SearchError('Wrong point provided')

        if point or input_address:
            search_params = SolrSpatialFieldSearchBackend().search_params(
                point, input_address, search_params)

        return search_params

    # IResourceView
    def info(self):
        return {
                "name": "custom", 
                "title": "Custom View",
                "always_available": True,
                "preview_enabled": False,
                "iframed": False,
                "schema": {"config_obj": [ignore_missing]}
                }

    def can_view(self):
        return True

