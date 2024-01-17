# encoding: utf-8

"""API functions for searching for and getting data from CKAN."""
from __future__ import annotations

import logging
import json
from typing import Any, cast
import re
from itertools import zip_longest

from ckan.common import config, asbool


import ckan
import ckan.lib.dictization
import ckan.logic as logic
import ckan.logic.action
import ckan.logic.schema
import ckan.lib.navl.dictization_functions
import ckan.plugins as plugins
import ckan.lib.search as search

import ckan.lib.plugins as lib_plugins
import ckan.authz as authz
from ckan.lib.dictization import table_dictize

from ckan.common import _
from ckan.types import ActionResult, Context, DataDict
from typing_extensions import TypeAlias
from ckanext.wri.model.notification import (
    Notification,
    notification_dictize,
    notification_list_dictize,
)
from ckanext.wri.model.pending_datasets import PendingDatasets
import datetime
import ckan.plugins.toolkit as tk
from ckanext.wri.logic.auth import schema

log = logging.getLogger("ckan.logic")

# Define some shortcuts
# Ensure they are module-private so that they don't get loaded as available
# actions in the action API.
_validate = ckan.lib.navl.dictization_functions.validate
_check_access = logic.check_access
NotFound = logic.NotFound
NotAuthorized = logic.NotAuthorized
ValidationError = logic.ValidationError
get_action = ckan.logic.get_action


NotificationGetUserViewedActivity: TypeAlias = None
log = logging.getLogger(__name__)


SOLR_BOOLEAN_FIELDS = [
    "featured_dataset",
]


def _fix_solr_boolean_query(query: str, field: str) -> str:
    """
    Solr does not support boolean queries with capital letters (the Python boolean style).
    This function replaces the uppercase boolean values with lowercase ones for a given field.

    :param query: the query to fix
    :type query: string
    :param field: the field to fix
    :type field: string
    :returns: the fixed query
    :rtype: string
    """
    safe_field = re.escape(field)

    query = re.sub(r"\b{}:True\b".format(safe_field), "{}:true".format(field), query)
    query = re.sub(r"\b{}:False\b".format(safe_field), "{}:false".format(field), query)

    return query


@logic.side_effect_free
def package_search(context: Context, data_dict: DataDict) -> ActionResult.PackageSearch:
    """
    Searches for packages satisfying a given search criteria.

    This action accepts solr search query parameters (details below), and
    returns a dictionary of results, including dictized datasets that match
    the search criteria, a search count and also facet information.

    **Solr Parameters:**

    For more in depth treatment of each paramter, please read the
    `Solr Documentation
    <https://lucene.apache.org/solr/guide/6_6/common-query-parameters.html>`_.

    This action accepts a *subset* of solr's search query parameters:


    :param q: the solr query.  Optional.  Default: ``"*:*"``
    :type q: string
    :param fq: any filter queries to apply.  Note: ``+site_id:{ckan_site_id}``
        is added to this string prior to the query being executed.
    :type fq: string
    :param fq_list: additional filter queries to apply.
    :type fq_list: list of strings
    :param sort: sorting of the search results.  Optional.  Default:
        ``'score desc, metadata_modified desc'``.  As per the solr
        documentation, this is a comma-separated string of field names and
        sort-orderings.
    :type sort: string
    :param rows: the maximum number of matching rows (datasets) to return.
        (optional, default: ``10``, upper limit: ``1000`` unless set in
        site's configuration ``ckan.search.rows_max``)
    :type rows: int
    :param start: the offset in the complete result for where the set of
        returned datasets should begin.
    :type start: int
    :param facet: whether to enable faceted results.  Default: ``True``.
    :type facet: string
    :param facet.mincount: the minimum counts for facet fields should be
        included in the results.
    :type facet.mincount: int
    :param facet.limit: the maximum number of values the facet fields return.
        A negative value means unlimited. This can be set instance-wide with
        the :ref:`search.facets.limit` config option. Default is 50.
    :type facet.limit: int
    :param facet.field: the fields to facet upon.  Default empty.  If empty,
        then the returned facet information is empty.
    :type facet.field: list of strings
    :param include_drafts: if ``True``, draft datasets will be included in the
        results. A user will only be returned their own draft datasets, and a
        sysadmin will be returned all draft datasets. Optional, the default is
        ``False``.
    :type include_drafts: bool
    :param include_deleted: if ``True``, deleted datasets will be included in the
        results (site configuration "ckan.search.remove_deleted_packages" must
        be set to False). Optional, the default is ``False``.
    :type include_deleted: bool
    :param include_private: if ``True``, private datasets will be included in
        the results. Only private datasets from the user's organizations will
        be returned and sysadmins will be returned all private datasets.
        Optional, the default is ``False``.
    :type include_private: bool
    :param use_default_schema: use default package schema instead of
        a custom schema defined with an IDatasetForm plugin (default: ``False``)
    :type use_default_schema: bool


    The following advanced Solr parameters are supported as well. Note that
    some of these are only available on particular Solr versions. See Solr's
    `dismax`_ and `edismax`_ documentation for further details on them:

    ``qf``, ``wt``, ``bf``, ``boost``, ``tie``, ``defType``, ``mm``


    .. _dismax: http://wiki.apache.org/solr/DisMaxQParserPlugin
    .. _edismax: http://wiki.apache.org/solr/ExtendedDisMax


    **Examples:**

    ``q=flood`` datasets containing the word `flood`, `floods` or `flooding`
    ``fq=tags:economy`` datasets with the tag `economy`
    ``facet.field=["tags"] facet.limit=10 rows=0`` top 10 tags

    **Results:**

    The result of this action is a dict with the following keys:

    :rtype: A dictionary with the following keys
    :param count: the number of results found.  Note, this is the total number
        of results found, not the total number of results returned (which is
        affected by limit and row parameters used in the input).
    :type count: int
    :param results: ordered list of datasets matching the query, where the
        ordering defined by the sort parameter used in the query.
    :type results: list of dictized datasets.
    :param facets: DEPRECATED.  Aggregated information about facet counts.
    :type facets: DEPRECATED dict
    :param search_facets: aggregated information about facet counts.  The outer
        dict is keyed by the facet field name (as used in the search query).
        Each entry of the outer dict is itself a dict, with a "title" key, and
        an "items" key.  The "items" key's value is a list of dicts, each with
        "count", "display_name" and "name" entries.  The display_name is a
        form of the name that can be used in titles.
    :type search_facets: nested dict of dicts.

    An example result: ::

     {'count': 2,
      'results': [ { <snip> }, { <snip> }],
      'search_facets': {u'tags': {'items': [{'count': 1,
                                             'display_name': u'tolstoy',
                                             'name': u'tolstoy'},
                                            {'count': 2,
                                             'display_name': u'russian',
                                             'name': u'russian'}
                                           ]
                                 }
                       }
     }

    **Limitations:**

    The full solr query language is not exposed, including.

    fl
        The parameter that controls which fields are returned in the solr
        query.
        fl can be  None or a list of result fields, such as
        ['id', 'extras_custom_field'].
        if fl = None, datasets are returned as a list of full dictionary.
    """

    # Fix boolean Solr query for featured datasets
    q = data_dict.get("q")

    for field in SOLR_BOOLEAN_FIELDS:
        if q and field in q:
            data_dict["q"] = _fix_solr_boolean_query(q, field)

    # sometimes context['schema'] is None
    schema = context.get("schema") or ckan.logic.schema.default_package_search_schema()
    data_dict, errors = _validate(data_dict, schema, context)
    # put the extras back into the data_dict so that the search can
    # report needless parameters
    data_dict.update(data_dict.get("__extras", {}))
    data_dict.pop("__extras", None)
    if errors:
        raise ValidationError(errors)

    model = context["model"]
    session = context["session"]
    user = context.get("user")

    _check_access("package_search", context, data_dict)

    # Move ext_ params to extras and remove them from the root of the search
    # params, so they don't cause and error
    data_dict["extras"] = data_dict.get("extras", {})
    for key in [key for key in data_dict.keys() if key.startswith("ext_")]:
        data_dict["extras"][key] = data_dict.pop(key)

    # set default search field
    data_dict["df"] = "text"

    # check if some extension needs to modify the search params
    for item in plugins.PluginImplementations(plugins.IPackageController):
        data_dict = item.before_dataset_search(data_dict)

    # the extension may have decided that it is not necessary to perform
    # the query
    abort = data_dict.get("abort_search", False)

    if data_dict.get("sort") in (None, "rank"):
        data_dict["sort"] = config.get("ckan.search.default_package_sort")

    results: list[dict[str, Any]] = []
    facets: dict[str, Any] = {}
    count = 0

    if not abort:
        if asbool(data_dict.get("use_default_schema")):
            data_source = "data_dict"
        else:
            data_source = "validated_data_dict"
        data_dict.pop("use_default_schema", None)

        result_fl = data_dict.get("fl")
        if not result_fl:
            data_dict["fl"] = "id {0}".format(data_source)
        else:
            data_dict["fl"] = " ".join(result_fl)

        data_dict.setdefault("fq", "")

        # Remove before these hit solr FIXME: whitelist instead
        include_private = asbool(data_dict.pop("include_private", False))
        include_drafts = asbool(data_dict.pop("include_drafts", False))
        include_deleted = asbool(data_dict.pop("include_deleted", False))

        if not include_private:
            data_dict["fq"] = "+capacity:public " + data_dict["fq"]

        if "+state" not in data_dict["fq"]:
            states = ["active"]
            if include_drafts:
                states.append("draft")
            if include_deleted:
                states.append("deleted")
            data_dict["fq"] += " +state:({})".format(" OR ".join(states))

        # Pop these ones as Solr does not need them
        extras = data_dict.pop("extras", None)

        # enforce permission filter based on user
        if context.get("ignore_auth") or (user and authz.is_sysadmin(user)):
            labels = None
        else:
            labels = lib_plugins.get_permission_labels().get_user_dataset_labels(
                context["auth_user_obj"]
            )

        query = search.query_for(model.Package)
        query.run(data_dict, permission_labels=labels)

        # Add them back so extensions can use them on after_search
        data_dict["extras"] = extras

        if result_fl:
            for package in query.results:
                if isinstance(package, str):
                    package = {result_fl[0]: package}
                extras = cast("dict[str, Any]", package.pop("extras", {}))
                package.update(extras)
                results.append(package)
        else:
            for package in query.results:
                # get the package object
                package_dict = package.get(data_source)
                ## use data in search index if there
                if package_dict:
                    # the package_dict still needs translating when being viewed
                    package_dict = json.loads(package_dict)
                    if context.get("for_view"):
                        for item in plugins.PluginImplementations(
                            plugins.IPackageController
                        ):
                            package_dict = item.before_dataset_view(package_dict)
                    results.append(package_dict)
                else:
                    log.error(
                        "No package_dict is coming from solr for package " "id %s",
                        package["id"],
                    )

        count = query.count
        facets = query.facets

    search_results: dict[str, Any] = {
        "count": count,
        "facets": facets,
        "results": results,
        "sort": data_dict["sort"],
    }

    # create a lookup table of group name to title for all the groups and
    # organizations in the current search's facets.
    group_names = []
    for field_name in ("groups", "organization"):
        group_names.extend(facets.get(field_name, {}).keys())

    groups = (
        session.query(model.Group.name, model.Group.title)
        # type_ignore_reason: incomplete SQLAlchemy types
        .filter(model.Group.name.in_(group_names)).all()  # type: ignore
        if group_names
        else []
    )
    group_titles_by_name = dict(groups)

    # Transform facets into a more useful data structure.
    restructured_facets: dict[str, Any] = {}
    for key, value in facets.items():
        restructured_facets[key] = {"title": key, "items": []}
        for key_, value_ in value.items():
            new_facet_dict = {}
            new_facet_dict["name"] = key_
            if key in ("groups", "organization"):
                display_name = group_titles_by_name.get(key_, key_)
                display_name = (
                    display_name if display_name and display_name.strip() else key_
                )
                new_facet_dict["display_name"] = display_name
            elif key == "license_id":
                license = model.Package.get_license_register().get(key_)
                if license:
                    new_facet_dict["display_name"] = license.title
                else:
                    new_facet_dict["display_name"] = key_
            else:
                new_facet_dict["display_name"] = key_
            new_facet_dict["count"] = value_
            restructured_facets[key]["items"].append(new_facet_dict)
    search_results["search_facets"] = restructured_facets

    # check if some extension needs to modify the search results
    for item in plugins.PluginImplementations(plugins.IPackageController):
        search_results = item.after_dataset_search(search_results, data_dict)

    # After extensions have had a chance to modify the facets, sort them by
    # display name.
    for facet in search_results["search_facets"]:
        search_results["search_facets"][facet]["items"] = sorted(
            search_results["search_facets"][facet]["items"],
            key=lambda facet: facet["display_name"],
            reverse=True,
        )

    return search_results


@logic.side_effect_free
def notification_get_all(
    context: Context, data_dict: DataDict
) -> NotificationGetUserViewedActivity:
    """Get the notifications for a user by sender_id or receiver_id"""
    model = context["model"]
    session = context["session"]

    tk.check_access("notification_get_all", context, data_dict)
    sender_id = data_dict.get("sender_id")
    recipient_id = data_dict.get("recipient_id")

    user_obj = model.User.get(context["user"])
    user_id = user_obj.id

    sch = context.get("schema") or schema.default_get_notification_schema()
    data, errors = tk.navl_validate(data_dict, sch, context)
    if errors:
        raise tk.ValidationError(errors)

    notification_objects = Notification.get(
        recipient_id=recipient_id, sender_id=sender_id
    )

    try:
        iter(notification_objects)
        notification_objecst_result = notification_list_dictize(
            notification_objects, context
        )
    except TypeError:
        notification_objecst_result = notification_dictize(
            notification_objects, context
        )

    if not notification_objecst_result:
        raise logic.NotFound(_("Notification not found"))

    return notification_objecst_result


@logic.side_effect_free
def pending_dataset_show(context: Context, data_dict: DataDict):
    """Get a pending dataset by package_id"""
    package_id = data_dict.get("package_id")

    if not package_id:
        raise logic.ValidationError(_("package_id is required"))

    tk.check_access("pending_dataset_show", context, {"id": package_id})

    pending_dataset = None

    try:
        pending_dataset = PendingDatasets.get(package_id=package_id)
    except Exception as e:
        log.error(e)
        raise tk.ValidationError(e)

    if not pending_dataset:
        raise logic.NotFound(_(f"Pending Dataset not found: {package_id}"))

    return pending_dataset


@logic.side_effect_free
def pending_diff_show(context: Context, data_dict: DataDict):
    """Get a pending dataset by package_id"""
    package_id = data_dict.get("package_id")

    if not package_id:
        raise logic.ValidationError(_("package_id is required"))

    tk.check_access("package_show", context, {"id": package_id})

    dataset_diff = None

    try:
        pending_dataset = PendingDatasets.get(package_id=package_id).get("package_data")
        existing_dataset = get_action("package_show")(context, {"id": package_id})
        dataset_diff = _diff(existing_dataset, pending_dataset)
    except Exception as e:
        log.error(e)
        raise tk.ValidationError(e)

    if not dataset_diff:
        dataset_diff = None
        # raise logic.NotFound(
        #     _("Diff not found for Pending Dataset: {}".format(package_id))
        # )

    return dataset_diff


def _diff(existing, pending, path=""):
    diff = {}
    keys = set(existing.keys()) | set(pending.keys())

    for key in keys:
        full_path = f"{path}.{key}" if path else key
        existing_value = existing.get(key, None)
        pending_value = pending.get(key, None)

        if isinstance(existing_value, dict) and isinstance(pending_value, dict):
            nested_diff = _diff(existing_value, pending_value, full_path)
            diff.update(nested_diff)
        elif isinstance(existing_value, list) and isinstance(pending_value, list):
            list_diff = _process_lists(existing_value, pending_value, full_path)
            diff.update(list_diff)
        elif existing_value != pending_value:
            diff[full_path] = {"old_value": existing_value, "new_value": pending_value}

    return diff


def _process_lists(existing_list, pending_list, path):
    list_diff = {}

    for index, (item_existing, item_pending) in enumerate(
        zip_longest(existing_list, pending_list)
    ):
        item_path = f"{path}[{index}]"

        if isinstance(item_existing, dict) and isinstance(item_pending, dict):
            item_diff = _diff(item_existing, item_pending, item_path)
            list_diff.update(item_diff)
        elif item_existing != item_pending:
            list_diff[item_path] = {
                "old_value": item_existing,
                "new_value": item_pending,
            }

    return list_diff
