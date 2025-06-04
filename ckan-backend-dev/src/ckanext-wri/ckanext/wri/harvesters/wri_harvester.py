from __future__ import absolute_import
import logging
import json
import requests
from requests.exceptions import HTTPError, RequestException
import datetime
from urllib.parse import urlencode, quote
import sqlalchemy as sa
import os
import requests
import tempfile

from ckantoolkit import config
from ckan import plugins as p
from ckan import model
from ckan.model import Session

from ckan.logic.schema import default_create_package_schema
from ckan.lib.navl.validators import ignore_missing, ignore

from ckanext.harvest.model import (
    HarvestObject,
)

from ckanext.harvest.logic.schema import unicode_safe

from ckanext.harvest.harvesters.base import HarvesterBase


from ckan import model
from ckan.logic import ValidationError, NotFound, get_action
from ckan.lib.helpers import json
from ckan.plugins import toolkit

from ckanext.harvest.model import HarvestObject


log = logging.getLogger(__name__)


def asbool_check(val) -> bool:
    return str(val).strip().lower() == "true"


class WRIHarvesterBase(HarvesterBase):
    """
    Base class for WRI harvesters
    Uses `old_package_create` and `old_package_update` actions instead of
    `package_create` and `package_update` to avoid the approval workflow
    """

    def _upload_resources(self, context, package_dict, harvest_object):
        """
        Uploads resources
        """
        resources = package_dict.get("resources", [])

        import cgi

        for resource in resources:
            file_url = resource.get("url")
            file_name = file_url.split("/")[-1]
            resource["package_id"] = package_dict["id"]

            if file_url:
                if harvest_object.job.source.url.strip("/") in file_url:
                    try:
                        headers = {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36"
                        }
                        response = requests.get(
                            file_url, stream=True, allow_redirects=True, headers=headers
                        )
                        response.raise_for_status()
                        resource.pop("url", None)

                        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                            for chunk in response.iter_content(chunk_size=8192):
                                temp_file.write(chunk)

                            temp_file.flush()

                        with open(temp_file.name, "rb") as file_object:
                            environ = {"REQUEST_METHOD": "POST"}
                            headers = {
                                "Content-Type": f"multipart/form-data; boundary=----WebKitFormBoundary"
                            }
                            storage = cgi.FieldStorage(
                                fp=file_object,
                                environ=environ,
                                headers=headers,
                            )
                            storage.filename = file_name
                            storage.file = file_object

                            resource["upload"] = storage
                            resource["url_type"] = "upload"
                            resource["url"] = file_name

                            p.toolkit.get_action("resource_update")(context, resource)

                        os.remove(temp_file.name)

                    except requests.RequestException as e:
                        log.error(
                            f"Failed to download file from {file_url}, setting resource to source URL: {e}"
                        )

        try:
            package_dict = p.toolkit.get_action("package_show")(context, {"id": package_dict["id"]})
        except NotFound:
            log.error(f"Updated package {package_dict['id']} not found")
        except Exception as e:
            log.error(f"Error updating package {package_dict['id']}: {e}")

        return package_dict

    def _create_or_update_package(
        self, package_dict, harvest_object, package_dict_form="rest", create_resources=False
    ):
        """
        Creates a new package or updates an existing one according to the
        package dictionary provided.

        The package dictionary can be in one of two forms:

        1. 'rest' - as seen on the RESTful API:

                http://datahub.io/api/rest/dataset/1996_population_census_data_canada

           This is the legacy form. It is the default to provide backward
           compatibility.

           * 'extras' is a dict e.g. {'theme': 'health', 'sub-theme': 'cancer'}
           * 'tags' is a list of strings e.g. ['large-river', 'flood']

        2. 'package_show' form, as provided by the Action API (CKAN v2.0+):

               http://datahub.io/api/action/package_show?id=1996_population_census_data_canada

           * 'extras' is a list of dicts
                e.g. [{'key': 'theme', 'value': 'health'},
                        {'key': 'sub-theme', 'value': 'cancer'}]
           * 'tags' is a list of dicts
                e.g. [{'name': 'large-river'}, {'name': 'flood'}]

        Note that the package_dict must contain an id, which will be used to
        check if the package needs to be created or updated (use the remote
        dataset id).

        If the remote server provides the modification date of the remote
        package, add it to package_dict['metadata_modified'].

        :returns: The same as what import_stage should return. i.e. True if the
                  create or update occurred ok, 'unchanged' if it didn't need
                  updating or False if there were errors.


        TODO: Not sure it is worth keeping this function. If useful it should
        use the output of package_show logic function (maybe keeping support
        for rest api based dicts
        """
        assert package_dict_form in ("rest", "package_show")

        try:
            # Change default schema
            schema = default_create_package_schema()
            schema["id"] = [ignore_missing, unicode_safe]
            schema["__junk"] = [ignore]

            # Check API version
            if self.config:
                try:
                    api_version = int(self.config.get("api_version", 2))
                except ValueError:
                    raise ValueError("api_version must be an integer")
            else:
                api_version = 2

            user_name = self._get_user_name()
            context = {
                "model": model,
                "session": Session,
                "user": user_name,
                "api_version": api_version,
                "schema": schema,
                "ignore_auth": True,
            }

            if self.config and self.config.get("clean_tags", False):
                tags = package_dict.get("tags", [])
                package_dict["tags"] = self._clean_tags(tags)

            # Check if package exists
            try:
                # _find_existing_package can be overridden if necessary
                existing_package_dict = self._find_existing_package(package_dict)

                # In case name has been modified when first importing. See issue #101.
                package_dict["name"] = existing_package_dict["name"]

                # Check modified date
                if "metadata_modified" not in package_dict or package_dict[
                    "metadata_modified"
                ] > existing_package_dict.get("metadata_modified"):
                    log.info(
                        "Package with GUID %s exists and needs to be updated"
                        % harvest_object.guid
                    )
                    # Update package
                    context.update({"id": package_dict["id"]})
                    package_dict.setdefault("name", existing_package_dict["name"])

                    for field in p.toolkit.aslist(
                        config.get("ckan.harvest.not_overwrite_fields")
                    ):
                        if field in existing_package_dict:
                            package_dict[field] = existing_package_dict[field]
                    new_package = p.toolkit.get_action(
                        "old_package_update"
                    )(context, package_dict)
                    package_dict["id"] = new_package["id"]

                    if create_resources:
                        log.info("create_resources is set to True, uploading resources")
                        new_package = self._upload_resources(context, package_dict, harvest_object)
                else:
                    log.info(
                        "No changes to package with GUID %s, skipping..."
                        % harvest_object.guid
                    )
                    # NB harvest_object.current/package_id are not set
                    return "unchanged"

                # Flag the other objects linking to this package as not current anymore
                Session.query(HarvestObject).filter(
                    HarvestObject.package_id == new_package["id"]
                ).update({"current": False})

                # Flag this as the current harvest object
                harvest_object.package_id = new_package["id"]
                harvest_object.current = True
                harvest_object.save()

            except p.toolkit.ObjectNotFound:
                # Package needs to be created

                # Get rid of auth audit on the context otherwise we'll get an
                # exception
                context.pop("__auth_audit", None)

                # Set name for new package to prevent name conflict, see issue #117
                if package_dict.get("name", None):
                    package_dict["name"] = self._gen_new_name(package_dict["name"])
                else:
                    package_dict["name"] = self._gen_new_name(package_dict["title"])

                log.info(
                    "Package with GUID %s does not exist, let's create it"
                    % harvest_object.guid
                )
                harvest_object.current = True
                harvest_object.package_id = package_dict["id"]
                # Defer constraints and flush so the dataset can be indexed with
                # the harvest object id (on the after_show hook from the harvester
                # plugin)
                harvest_object.add()

                model.Session.execute(
                    sa.text("SET CONSTRAINTS harvest_object_package_id_fkey DEFERRED")
                )
                model.Session.flush()

                new_package = p.toolkit.get_action(
                    "old_package_create"
                )(context, package_dict)
                package_dict["id"] = new_package["id"]

                if create_resources:
                    log.info("create_resources is set to True, uploading resources")
                    new_package = self._upload_resources(context, package_dict, harvest_object)

            Session.commit()

            return True

        except p.toolkit.ValidationError as e:
            log.exception(e)
            self._save_object_error(
                "Invalid package with GUID %s: %r"
                % (harvest_object.guid, e.error_dict),
                harvest_object,
                "Import",
            )
        except Exception as e:
            log.exception(e)
            self._save_object_error("%r" % e, harvest_object, "Import")

        return None


class CKANHarvesterWRI(WRIHarvesterBase):
    """
    A Harvester for WRI CKAN instances
    """

    config = None

    api_version = 2
    action_api_version = 3

    def _get_action_api_offset(self):
        return "/api/%d/action" % self.action_api_version

    def _get_search_api_offset(self):
        return "%s/package_search" % self._get_action_api_offset()

    def _get_content(self, url):

        headers = {}
        api_key = self.config.get("api_key")
        if api_key:
            headers["Authorization"] = api_key

        try:
            http_request = requests.get(url, headers=headers)
        except HTTPError as e:
            raise ContentFetchError(
                "HTTP error: %s %s" % (e.response.status_code, e.request.url)
            )
        except RequestException as e:
            raise ContentFetchError("Request error: %s" % e)
        except Exception as e:
            raise ContentFetchError("HTTP general exception: %s" % e)
        return http_request.text

    def _get_group(self, base_url, group):
        url = base_url + self._get_action_api_offset() + "/group_show?id=" + group["id"]
        try:
            content = self._get_content(url)
            data = json.loads(content)
            if self.action_api_version == 3:
                return data.pop("result")
            return data
        except (ContentFetchError, ValueError):
            log.debug("Could not fetch/decode remote group")
            raise RemoteResourceError("Could not fetch/decode remote group")

    def _get_organization(self, base_url, org_name):
        url = (
            base_url
            + self._get_action_api_offset()
            + "/organization_show?id="
            + org_name
        )
        try:
            content = self._get_content(url)
            content_dict = json.loads(content)
            return content_dict["result"]
        except (ContentFetchError, ValueError, KeyError):
            log.debug("Could not fetch/decode remote group")
            raise RemoteResourceError("Could not fetch/decode remote organization")

    def _set_config(self, config_str):
        if config_str:
            self.config = json.loads(config_str)
            if "api_version" in self.config:
                self.api_version = int(self.config["api_version"])

            log.debug("Using config: %r", self.config)
        else:
            self.config = {}

    def info(self):
        return {
            "name": "ckan",
            "title": "CKAN",
            "description": "Harvests remote CKAN instances",
            "form_config_interface": "Text",
        }

    def validate_config(self, config):
        if not config:
            return config

        try:
            config_obj = json.loads(config)

            if "api_version" in config_obj:
                try:
                    int(config_obj["api_version"])
                except ValueError:
                    raise ValueError("api_version must be an integer")

            if "default_tags" in config_obj:
                if not isinstance(config_obj["default_tags"], list):
                    raise ValueError("default_tags must be a list")
                if config_obj["default_tags"] and not isinstance(
                    config_obj["default_tags"][0], dict
                ):
                    raise ValueError("default_tags must be a list of " "dictionaries")

            if "default_groups" in config_obj:
                if not isinstance(config_obj["default_groups"], list):
                    raise ValueError(
                        "default_groups must be a *list* of group" " names/ids"
                    )
                if config_obj["default_groups"] and not isinstance(
                    config_obj["default_groups"][0], str
                ):
                    raise ValueError(
                        "default_groups must be a list of group "
                        "names/ids (i.e. strings)"
                    )

                # Check if default groups exist
                context = {"model": model, "user": toolkit.c.user}
                config_obj["default_group_dicts"] = []
                for group_name_or_id in config_obj["default_groups"]:
                    try:
                        group = get_action("group_show")(
                            context, {"id": group_name_or_id}
                        )
                        # save the dict to the config object, as we'll need it
                        # in the import_stage of every dataset
                        config_obj["default_group_dicts"].append(group)
                    except NotFound:
                        raise ValueError("Default group not found")
                config = json.dumps(config_obj)

            if "default_extras" in config_obj:
                if not isinstance(config_obj["default_extras"], dict):
                    raise ValueError("default_extras must be a dictionary")

            if (
                "organizations_filter_include" in config_obj
                and "organizations_filter_exclude" in config_obj
            ):
                raise ValueError(
                    "Harvest configuration cannot contain both "
                    "organizations_filter_include and organizations_filter_exclude"
                )

            if (
                "groups_filter_include" in config_obj
                and "groups_filter_exclude" in config_obj
            ):
                raise ValueError(
                    "Harvest configuration cannot contain both "
                    "groups_filter_include and groups_filter_exclude"
                )

            if "user" in config_obj:
                # Check if user exists
                context = {"model": model, "user": toolkit.c.user}
                try:
                    get_action("user_show")(context, {"id": config_obj.get("user")})
                except NotFound:
                    raise ValueError("User not found")

            for key in ("read_only", "force_all"):
                if key in config_obj:
                    if not isinstance(config_obj[key], bool):
                        raise ValueError("%s must be boolean" % key)

        except ValueError as e:
            raise e

        return config

    def modify_package_dict(self, package_dict, harvest_object):
        """
        Allows custom harvesters to modify the package dict before
        creating or updating the actual package.
        """
        return package_dict

    def gather_stage(self, harvest_job):
        log.debug("In CKANHarvester gather_stage (%s)", harvest_job.source.url)
        toolkit.requires_ckan_version(min_version="2.0")
        get_all_packages = True

        self._set_config(harvest_job.source.config)

        # Get source URL
        remote_ckan_base_url = harvest_job.source.url.rstrip("/")

        # Filter in/out datasets from particular organizations
        fq_terms = []
        org_filter_include = self.config.get("organizations_filter_include", [])
        org_filter_exclude = self.config.get("organizations_filter_exclude", [])
        if org_filter_include:
            fq_terms.append(
                " OR ".join(
                    "organization:%s" % org_name for org_name in org_filter_include
                )
            )
        elif org_filter_exclude:
            fq_terms.extend(
                "-organization:%s" % org_name for org_name in org_filter_exclude
            )

        groups_filter_include = self.config.get("groups_filter_include", [])
        groups_filter_exclude = self.config.get("groups_filter_exclude", [])
        if groups_filter_include:
            fq_terms.append(
                " OR ".join(
                    "groups:%s" % group_name for group_name in groups_filter_include
                )
            )
        elif groups_filter_exclude:
            fq_terms.extend(
                "-groups:%s" % group_name for group_name in groups_filter_exclude
            )

        # Ideally we can request from the remote CKAN only those datasets
        # modified since the last completely successful harvest.
        last_error_free_job = self.last_error_free_job(harvest_job)
        log.debug("Last error-free job: %r", last_error_free_job)
        if last_error_free_job and not self.config.get("force_all", False):
            get_all_packages = False

            # Request only the datasets modified since
            last_time = last_error_free_job.gather_started
            # Note: SOLR works in UTC, and gather_started is also UTC, so
            # this should work as long as local and remote clocks are
            # relatively accurate. Going back a little earlier, just in case.
            get_changes_since = (last_time - datetime.timedelta(hours=1)).isoformat()
            log.info("Searching for datasets modified since: %s UTC", get_changes_since)

            fq_since_last_time = "metadata_modified:[{since}Z TO *]".format(
                since=get_changes_since
            )

            try:
                pkg_dicts = self._search_for_datasets(
                    remote_ckan_base_url, fq_terms + [fq_since_last_time]
                )
            except SearchError as e:
                log.info(
                    "Searching for datasets changed since last time "
                    "gave an error: %s",
                    e,
                )
                get_all_packages = True

            if not get_all_packages and not pkg_dicts:
                log.info(
                    "No datasets have been updated on the remote "
                    "CKAN instance since the last harvest job %s",
                    last_time,
                )
                return []

        # Fall-back option - request all the datasets from the remote CKAN
        if get_all_packages:
            # Request all remote packages
            try:
                pkg_dicts = self._search_for_datasets(remote_ckan_base_url, fq_terms)
            except SearchError as e:
                log.info("Searching for all datasets gave an error: %s", e)
                self._save_gather_error(
                    "Unable to search remote CKAN for datasets:%s url:%s"
                    "terms:%s" % (e, remote_ckan_base_url, fq_terms),
                    harvest_job,
                )
                return None
        if not pkg_dicts:
            self._save_gather_error(
                "No datasets found at CKAN: %s" % remote_ckan_base_url, harvest_job
            )
            return []

        # Create harvest objects for each dataset
        try:
            package_ids = set()
            object_ids = []
            for pkg_dict in pkg_dicts:
                if pkg_dict["id"] in package_ids:
                    log.info(
                        "Discarding duplicate dataset %s - probably due "
                        "to datasets being changed at the same time as "
                        "when the harvester was paging through",
                        pkg_dict["id"],
                    )
                    continue
                package_ids.add(pkg_dict["id"])

                log.debug(
                    "Creating HarvestObject for %s %s", pkg_dict["name"], pkg_dict["id"]
                )
                obj = HarvestObject(
                    guid=pkg_dict["id"], job=harvest_job, content=json.dumps(pkg_dict)
                )
                obj.save()
                object_ids.append(obj.id)

            return object_ids
        except Exception as e:
            self._save_gather_error("%r" % e.message, harvest_job)

    def _search_for_datasets(self, remote_ckan_base_url, fq_terms=None):
        """Does a dataset search on a remote CKAN and returns the results.

        Deals with paging to return all the results, not just the first page.
        """
        base_search_url = remote_ckan_base_url + self._get_search_api_offset()
        params = {"rows": "100", "start": "0"}
        # There is the worry that datasets will be changed whilst we are paging
        # through them.
        # * In SOLR 4.7 there is a cursor, but not using that yet
        #   because few CKANs are running that version yet.
        # * However we sort, then new names added or removed before the current
        #   page would cause existing names on the next page to be missed or
        #   double counted.
        # * Another approach might be to sort by metadata_modified and always
        #   ask for changes since (and including) the date of the last item of
        #   the day before. However if the entire page is of the exact same
        #   time, then you end up in an infinite loop asking for the same page.
        # * We choose a balanced approach of sorting by ID, which means
        #   datasets are only missed if some are removed, which is far less
        #   likely than any being added. If some are missed then it is assumed
        #   they will harvested the next time anyway. When datasets are added,
        #   we are at risk of seeing datasets twice in the paging, so we detect
        #   and remove any duplicates.
        params["sort"] = "id asc"
        if fq_terms:
            params["fq"] = f"({' OR '.join(fq_terms)})"

        pkg_dicts = []
        pkg_ids = set()
        previous_content = None
        while True:
            url = base_search_url + "?" + urlencode(params, quote_via=quote)

            try:
                content = self._get_content(url)
            except ContentFetchError as e:
                raise SearchError(
                    "Error sending request to search remote "
                    "CKAN instance %s using URL %r. Error: %s"
                    % (remote_ckan_base_url, url, e)
                )

            if previous_content and content == previous_content:
                raise SearchError("The paging doesn't seem to work. URL: %s" % url)
            try:
                response_dict = json.loads(content)
            except ValueError:
                raise SearchError(
                    "Response from remote CKAN was not JSON: %r" % content
                )
            try:
                pkg_dicts_page = response_dict.get("result", {}).get("results", [])
            except ValueError:
                raise SearchError(
                    "Response JSON did not contain "
                    "result/results: %r" % response_dict
                )

            # Weed out any datasets found on previous pages (should datasets be
            # changing while we page)
            ids_in_page = set(p["id"] for p in pkg_dicts_page)
            duplicate_ids = ids_in_page & pkg_ids
            if duplicate_ids:
                pkg_dicts_page = [
                    p for p in pkg_dicts_page if p["id"] not in duplicate_ids
                ]
            pkg_ids |= ids_in_page

            pkg_dicts.extend(pkg_dicts_page)

            if len(pkg_dicts_page) == 0:
                break

            params["start"] = str(int(params["start"]) + int(params["rows"]))

        return pkg_dicts

    def fetch_stage(self, harvest_object):
        # Nothing to do here - we got the package dict in the search in the
        # gather stage
        return True

    def import_stage(self, harvest_object):
        log.debug("In CKANHarvester import_stage")

        base_context = {
            "model": model,
            "session": model.Session,
            "user": self._get_user_name(),
        }
        if not harvest_object:
            log.error("No harvest object received")
            return False

        if harvest_object.content is None:
            self._save_object_error(
                "Empty content for object %s" % harvest_object.id,
                harvest_object,
                "Import",
            )
            return False

        self._set_config(harvest_object.job.source.config)

        create_resources = asbool_check(
            self.config.get("create_resources", False)
        )

        try:
            package_dict = json.loads(harvest_object.content)

            if package_dict.get("type") == "harvest":
                log.warn("Remote dataset is a harvest source, ignoring...")
                return True

            # Set default tags if needed
            default_tags = self.config.get("default_tags", [])
            if default_tags:
                if "tags" not in package_dict:
                    package_dict["tags"] = []
                package_dict["tags"].extend(
                    [t for t in default_tags if t not in package_dict["tags"]]
                )

            remote_groups = self.config.get("remote_groups", None)
            if remote_groups not in ("only_local", "create"):
                # Ignore remote groups
                package_dict.pop("groups", None)
            else:
                if "groups" not in package_dict:
                    package_dict["groups"] = []

                # check if remote groups exist locally, otherwise remove
                validated_groups = []

                for group_ in package_dict["groups"]:
                    try:
                        try:
                            if "id" in group_:
                                data_dict = {"id": group_["id"]}
                                group = get_action("group_show")(
                                    base_context.copy(), data_dict
                                )
                            else:
                                raise NotFound

                        except NotFound:
                            if "name" in group_:
                                data_dict = {"id": group_["name"]}
                                group = get_action("group_show")(
                                    base_context.copy(), data_dict
                                )
                            else:
                                raise NotFound
                        # Found local group
                        validated_groups.append(
                            {"id": group["id"], "name": group["name"]}
                        )

                    except NotFound:
                        log.info("Group %s is not available", group_)
                        if remote_groups == "create":
                            try:
                                group = self._get_group(
                                    harvest_object.source.url, group_
                                )
                            except RemoteResourceError:
                                log.error("Could not get remote group %s", group_)
                                continue

                            for key in [
                                "packages",
                                "created",
                                "users",
                                "groups",
                                "tags",
                                "extras",
                            ]:
                                group.pop(key, None)

                            image_display_url = group.get("image_display_url")

                            if image_display_url:
                                group["image_url"] = image_display_url

                            get_action("group_create")(base_context.copy(), group)
                            log.info("Group %s has been newly created", group_)
                            validated_groups.append(
                                {"id": group["id"], "name": group["name"]}
                            )

                package_dict["groups"] = validated_groups

            # Local harvest source organization
            source_dataset = get_action("package_show")(
                base_context.copy(), {"id": harvest_object.source.id}
            )
            local_org = source_dataset.get("owner_org")

            remote_orgs = self.config.get("remote_orgs", None)

            if remote_orgs not in ("only_local", "create"):
                # Assign dataset to the source organization
                package_dict["owner_org"] = local_org
            else:
                if "owner_org" not in package_dict:
                    package_dict["owner_org"] = None

                # check if remote org exist locally, otherwise remove
                validated_org = None
                remote_org = package_dict["owner_org"]

                if remote_org:
                    try:
                        data_dict = {"id": remote_org}
                        org = get_action("organization_show")(
                            base_context.copy(), data_dict
                        )
                        validated_org = org["id"]
                    except NotFound:
                        log.info("Organization %s is not available", remote_org)
                        if remote_orgs == "create":
                            try:
                                try:
                                    org = self._get_organization(
                                        harvest_object.source.url, remote_org
                                    )
                                except RemoteResourceError:
                                    # fallback if remote CKAN exposes organizations as groups
                                    # this especially targets older versions of CKAN
                                    org = self._get_group(
                                        harvest_object.source.url, remote_org
                                    )

                                for key in [
                                    "packages",
                                    "created",
                                    "users",
                                    "groups",
                                    "tags",
                                    "extras",
                                ]:
                                    org.pop(key, None)

                                image_display_url = org.get("image_display_url")

                                if image_display_url:
                                    org["image_url"] = image_display_url

                                get_action("organization_create")(
                                    base_context.copy(), org
                                )
                                log.info(
                                    "Organization %s has been newly created", remote_org
                                )
                                validated_org = org["id"]
                            except (RemoteResourceError, ValidationError):
                                log.error("Could not get remote org %s", remote_org)

                package_dict["owner_org"] = validated_org or local_org

            # Set default groups if needed
            default_groups = self.config.get("default_groups", [])

            if default_groups:
                if "groups" not in package_dict:
                    package_dict["groups"] = []
                existing_group_ids = [g["id"] for g in package_dict["groups"]]
                package_dict["groups"].extend(
                    [
                        g
                        for g in self.config["default_group_dicts"]
                        if g["id"] not in existing_group_ids
                    ]
                )

            # Set default extras if needed
            default_extras = self.config.get("default_extras", {})

            def get_extra(key, package_dict):
                for extra in package_dict.get("extras", []):
                    if extra["key"] == key:
                        return extra

            if default_extras:
                override_extras = self.config.get("override_extras", False)
                if "extras" not in package_dict:
                    package_dict["extras"] = []
                for key, value in default_extras.items():
                    existing_extra = get_extra(key, package_dict)
                    if existing_extra and not override_extras:
                        continue  # no need for the default
                    if existing_extra:
                        package_dict["extras"].remove(existing_extra)
                    # Look for replacement strings
                    if isinstance(value, str):
                        value = value.format(
                            harvest_source_id=harvest_object.job.source.id,
                            harvest_source_url=harvest_object.job.source.url.strip("/"),
                            harvest_source_title=harvest_object.job.source.title,
                            harvest_job_id=harvest_object.job.id,
                            harvest_object_id=harvest_object.id,
                            dataset_id=package_dict["id"],
                        )

                    package_dict["extras"].append({"key": key, "value": value})

            for resource in package_dict.get("resources", []):
                # Clear remote url_type for resources (eg datastore, upload) as
                # we are only creating normal resources with links to the
                # remote ones


                if (
                    create_resources is False
                    and resource.get("url_type") == "upload"
                    and harvest_object.job.source.url.strip("/")
                    not in resource.get("url", "")
                ):
                    resource.pop("url_type", None)

                # Clear revision_id as the revision won't exist on this CKAN
                # and saving it will cause an IntegrityError with the foreign
                # key.
                resource.pop("revision_id", None)

            package_dict = self.modify_package_dict(package_dict, harvest_object)

            result = self._create_or_update_package(
                package_dict, harvest_object, package_dict_form="package_show", create_resources=create_resources
            )

            return result
        except ValidationError as e:
            self._save_object_error(
                "Invalid package with GUID %s: %r"
                % (harvest_object.guid, e.error_dict),
                harvest_object,
                "Import",
            )
        except Exception as e:
            self._save_object_error("%s" % e, harvest_object, "Import")


class ContentFetchError(Exception):
    pass


class ContentNotFoundError(ContentFetchError):
    pass


class RemoteResourceError(Exception):
    pass


class SearchError(Exception):
    pass
