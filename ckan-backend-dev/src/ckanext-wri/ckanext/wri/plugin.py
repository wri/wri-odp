import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
import ckan.lib.plugins as lib_plugins

import ckanext.wri.logic.action as action
import ckanext.wri.logic.validators as wri_validators
from ckanext.wri.logic.action.get import package_search, get_user_viewed_activity, get_user_viewed_activity_all
from ckan import model, logic, authz

import logging
log = logging.getLogger(__name__)


class WriPlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IValidators)
    plugins.implements(plugins.IFacets)
    plugins.implements(plugins.IClick)
    plugins.implements(plugins.IActions)
    plugins.implements(plugins.IPermissionLabels)

    # IConfigurer

    def update_config(self, config_):
        toolkit.add_template_directory(config_, "templates")
        toolkit.add_public_directory(config_, "public")
        toolkit.add_resource("assets", "wri")

    def get_commands(self):
        """CLI commands - Creates activity_viewed data tables"""
        import click

        @click.command()
        def activitydb():
            """Creates activity_viewed data tables"""
            from ckanext.wri.model import setup
            setup()

        return [activitydb]

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
            'get_user_viewed_activity': get_user_viewed_activity,
            'get_user_viewed_activity_all': get_user_viewed_activity_all

        }

    # IPermissionLabels

    def get_dataset_labels(self, dataset_obj: model.Package) -> list[str]:
        visibility_type = dataset_obj.extras.get('visibility_type', '')
        if dataset_obj.state == u'active' and visibility_type == "public":
            return [u'public']

        if authz.check_config_permission('allow_dataset_collaborators'):
            # Add a generic label for all this dataset collaborators
            labels = [u'collaborator-%s' % dataset_obj.id]
        else:
            labels = []

        if dataset_obj.owner_org and visibility_type in ["private"]:
            labels.append(u'member-%s' % dataset_obj.owner_org)
        elif visibility_type == "internal":
            labels.append(u'authenticated')
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

