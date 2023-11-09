import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit

import ckanext.wri.logic.action as action
from ckanext.wri.logic.validators import iso_language_code


class WriPlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IValidators)
    plugins.implements(plugins.IActions)

    # IConfigurer

    def update_config(self, config_):
        toolkit.add_template_directory(config_, "templates")
        toolkit.add_public_directory(config_, "public")
        toolkit.add_resource("assets", "wri")

    # IValidators

    def get_validators(self):
        return {
            "iso_language_code": iso_language_code
        }

    # IActions

    def get_actions(self):
        return {
            "password_reset": action.password_reset

        }

