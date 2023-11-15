import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit

import ckanext.wri.logic.action as action
import ckanext.wri.logic.validators as wri_validators
from ckanext.wri.logic.action.get import package_search


class WriPlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IValidators)
    plugins.implements(plugins.IFacets)
    plugins.implements(plugins.IActions)

    # IConfigurer

    def update_config(self, config_):
        toolkit.add_template_directory(config_, "templates")
        toolkit.add_public_directory(config_, "public")
        toolkit.add_resource("assets", "wri")

    # IValidators

    def get_validators(self):
        return {
            "iso_language_code": wri_validators.iso_language_code,
            "year_validator": wri_validators.year_validator
        }

    # IFacets

    def dataset_facets(self, facets_dict, package_type):
        facets_dict['language'] = toolkit._('Language')
        facets_dict['projects'] = toolkit._('Projects')
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
            'password_reset': action.password_reset

        }
