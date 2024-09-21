# encoding: utf-8

"""API functions for searching for and getting data from CKAN."""
from __future__ import annotations

import logging
import json
from typing import Any, cast
import re
from itertools import zip_longest

from ckan.common import config, asbool
from ckan.model import Package
from sqlalchemy import text, engine
from shapely import wkb, wkt


import ckan
import ckan.lib.dictization
import ckan.logic as logic
import ckan.logic.action
import ckan.logic.schema
import ckan.lib.navl.dictization_functions
import ckan.plugins as plugins
import ckan.lib.search as search
import ckan.plugins.toolkit as tk

import ckan.lib.plugins as lib_plugins
import ckan.authz as authz
from ckan.lib.dictization import table_dictize

from ckan.common import _
from ckan.types import ActionResult, Context, DataDict
from typing_extensions import TypeAlias
from ckanext.wri.helpers.data_api import get_shape_from_dataapi
from ckanext.wri.model.notification import (
    Notification,
    notification_dictize,
    notification_list_dictize,
)
from ckanext.wri.model.pending_datasets import PendingDatasets
import datetime
import ckan.plugins.toolkit as tk
from ckanext.wri.logic.auth import schema
from ckanext.activity.model import Activity
import ckan.lib.dictization.model_dictize as model_dictize
import sqlalchemy
import os
import shapely
from shapely.ops import unary_union
import ckan.lib.dictization.model_dictize as model_dictize
import ckan.model.misc as misc
from ckanext.wri.model.resource_location import ResourceLocation
import geoalchemy2
import sqlalchemy
from sqlalchemy import text

_select = sqlalchemy.sql.select
_or_ = sqlalchemy.or_
_and_ = sqlalchemy.and_
_func = sqlalchemy.func
_case = sqlalchemy.case


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
_select = sqlalchemy.sql.select
_func = sqlalchemy.func
_get_or_bust = logic.get_or_bust


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
    return_user = data_dict.pop("user", False)

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

                if return_user:
                    user = model_dictize.user_dictize(
                        model.User.get(package.get("creator_user_id")), context
                    )
                    package["user"] = user
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

                    try:
                        if return_user:
                            user = model_dictize.user_dictize(
                                model.User.get(package_dict.get("creator_user_id")),
                                context,
                            )
                            package_dict["user"] = user
                    except:
                        log.error(
                            "No user is coming from solr for package id %s",
                            package_dict.get("id"),
                        )
                        package_dict["user"] = {
                            "name": "Unknown",
                            "fullname": "Unknown",
                            "email": "Unknown",
                        }
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
        return []

    sender_obj = {}
    object_data = {}

    for notification in notification_objecst_result:
        sender_id = notification["sender_id"]
        object_id = notification["object_id"]
        if sender_id in sender_obj:
            notification["sender_obj"] = sender_obj[sender_id]
        else:
            temp = model_dictize.user_dictize(
                model.User.get(notification["sender_id"]), context
            )
            sender_obj[sender_id] = temp
            notification["sender_obj"] = temp

        if object_id in object_data:
            notification["object_data"] = object_data[object_id]
        else:
            temp = {}

            try:
                if notification["object_type"] == "dataset":
                    temp = dict(model.Package.get(notification["object_id"]).as_dict())
                elif notification["object_type"] == "topic":
                    temp = dict(model.Group.get(notification["object_id"]).as_dict())
                elif notification["object_type"] == "team":
                    temp = dict(model.Group.get(notification["object_id"]).as_dict())
            except AttributeError:
                log.error(f"Object not found: {json.dumps(notification, indent=2)}")

            notification["object_data"] = temp
            object_data[object_id] = temp

    return notification_objecst_result


@logic.side_effect_free
def pending_dataset_show(context: Context, data_dict: DataDict):
    """Get a pending dataset by package_id"""
    package_id = data_dict.get("package_id")
    package_name = data_dict.get("package_name")

    if not package_id and not package_name:
        raise logic.ValidationError(_("package_id is required"))

    if package_name:
        package_id = Package.get(package_name).id

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
    pending_dataset = None
    existing_dataset = None

    try:
        pending_dataset = PendingDatasets.get(package_id=package_id)
        if pending_dataset is not None:
            pending_dataset = pending_dataset.get("package_data")
            existing_dataset = get_action("package_show")(context, {"id": package_id})
            dataset_diff = _diff(existing_dataset, pending_dataset)
    except Exception as e:
        log.error(e)
        raise tk.ValidationError(e)

    if not dataset_diff:
        dataset_diff = {}
        # raise logic.NotFound(
        #     _("Diff not found for Pending Dataset: {}".format(package_id))
        # )

    if not existing_dataset:
        existing_dataset = {}

    return {
        "diff": dataset_diff,
        "old_dataset": existing_dataset,
        "new_dataset": pending_dataset,
    }


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

    if path == "resources":
        for index, pending_res in enumerate(pending_list):
            item_path = f"{path}[{index}]"
            item_existing_list = list(
                filter(lambda r: r.get("id") == pending_res.get("id"), existing_list)
            )

            if len(item_existing_list) > 0:
                existing_res = item_existing_list[0]
                item_diff = _diff(existing_res, pending_res, item_path)
                list_diff.update(item_diff)

        return list_diff

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


@logic.side_effect_free
def dataset_release_notes(context: Context, data_dict: DataDict):
    model = context["model"]
    conn = model.Session.connection()

    id = data_dict.get("id")
    sql = text(
        """
               select
                   distinct on ((data::json->>'package')::json->>'release_notes')
                   ((data::json->>'package')::json->>'release_notes') as release_notes,
                    to_char(timestamp, 'YYYY-MM-DD HH24:MI:SS.FF3') as date
               from
                    activity
               where
                    object_id='{}'
                    and activity_type='changed package'
                    and ((data::json->>'package')::json->>'release_notes') != ''
               order by
                    1, 2 DESC
               """.format(
            id
        )
    )
    q = conn.execute(sql)

    results = q.all()

    return results


@logic.side_effect_free
def dashboard_activity_listv2(context: Context, data_dict: DataDict):
    # get_action for dashboard_activity_list
    model = context["model"]
    results = get_action("dashboard_activity_list")(context, data_dict)
    user_data = {}
    for result in results:
        user_id = result["user_id"]
        if user_id in user_data:
            result["user_data"] = user_data[user_id]
        else:
            temp = model_dictize.user_dictize(
                model.User.get(result["user_id"]), context
            )
            result["user_data"] = temp
            user_data[user_id] = temp

    return results


@logic.side_effect_free
def package_activity_list_wri(context: Context, data_dict: DataDict):
    model = context["model"]
    results = get_action("package_activity_list")(context, data_dict)
    user_data = {}
    for result in results:
        user_id = result["user_id"]
        if user_id in user_data:
            result["user_data"] = user_data[user_id]
        else:
            temp = model_dictize.user_dictize(
                model.User.get(result["user_id"]), context
            )
            result["user_data"] = temp
            user_data[user_id] = temp
    return results


@logic.side_effect_free
def organization_activity_list_wri(context: Context, data_dict: DataDict):
    model = context["model"]
    results = get_action("organization_activity_list")(context, data_dict)
    user_data = {}
    for result in results:
        user_id = result["user_id"]
        if user_id in user_data:
            result["user_data"] = user_data[user_id]
        else:
            temp = model_dictize.user_dictize(
                model.User.get(result["user_id"]), context
            )
            result["user_data"] = temp
            user_data[user_id] = temp
    return results


@logic.side_effect_free
def group_activity_list_wri(context: Context, data_dict: DataDict):
    model = context["model"]
    results = get_action("group_activity_list")(context, data_dict)
    user_data = {}
    for result in results:
        user_id = result["user_id"]
        if user_id in user_data:
            result["user_data"] = user_data[user_id]
        else:
            temp = model_dictize.user_dictize(
                model.User.get(result["user_id"]), context
            )
            result["user_data"] = temp
            user_data[user_id] = temp
    return results


@logic.side_effect_free
def user_list_wri(context: Context, data_dict: DataDict):
    model = context["model"]
    results = get_action("user_list")(context, data_dict)
    query = model.Session.query(
        model.User,
        model.User.name.label("name"),
        model.User.fullname.label("fullname"),
        model.User.about.label("about"),
        model.User.email.label("email"),
        model.User.created.label("created"),
        _select(_func.count(model.Package.id))
        .where(
            model.Package.creator_user_id == model.User.id,
            model.Package.state == "active",
            model.Package.private == False,
        )
        .label("number_created_packages"),
    )

    site_id = config.get("ckan.site_id")
    query = query.filter(model.User.name != site_id)
    query = query.filter(model.User.state != model.State.DELETED)
    query = query.all()
    results = []
    org_details = {}
    for q in query:
        user = model_dictize.user_dictize(q[0], context)

        member_query = (
            model.Session.query(model.Member)
            .filter(
                model.Member.state == "active",
                model.Member.table_name == "user",
                model.Member.table_id == user["id"],
            )
            .all()
        )

        user["organizations"] = []

        for member in member_query:
            organization = None
            if member.group_id in org_details:
                organization = org_details[member.group_id]
            else:
                org_result = (
                    model.Session.query(model.Group)
                    .filter(
                        model.Group.id == member.group_id,
                        model.Group.is_organization == True,
                    )
                    .first()
                )
                if org_result:
                    organization = model_dictize.group_dictize(org_result, context)
                    org_details[member.group_id] = organization

            if organization:
                user_org = next(
                    filter(lambda x: x["id"] == user["id"], organization["users"])
                )
                organization["capacity"] = user_org["capacity"]
                user["organizations"].append(organization)

        results.append(user)

    return results


def get_hierarchy_group(context: Context, groups: Any, group_type: str, q: Any):
    def recurcive_tree_ids(org, group_hierarchy_ids=[]):
        group_hierarchy_ids.append(org["name"])
        for child in org["children"]:
            recurcive_tree_ids(child)
        return group_hierarchy_ids

    group_hierarchy_ids = []
    results = []
    for group in groups:
        if group in group_hierarchy_ids:
            continue
        group_tree = get_action("group_tree_section")(
            context, {"id": group, "type": group_type}
        )
        if q:
            group_tree["highlighted"] = True
        else:
            group_tree["highlighted"] = False
        group_hierarchy_ids += recurcive_tree_ids(group_tree)
        results.append(group_tree)
    return results


@logic.side_effect_free
def organization_list_wri(context: Context, data_dict: DataDict):
    orgs = get_action("organization_list")(context, data_dict)
    q = data_dict.get("q", False)
    results = get_hierarchy_group(context, orgs, "organization", q)
    return results


@logic.side_effect_free
def group_list_wri(context: Context, data_dict: DataDict):
    orgs = get_action("group_list")(context, data_dict)
    q = data_dict.get("q", False)
    results = get_hierarchy_group(context, orgs, "group", q)
    return results


@logic.side_effect_free
def group_list_authz_wri(context: Context, data_dict: DataDict):
    orgs = get_action("group_list_authz")(context, data_dict)
    # get list of name
    q = data_dict.get("q", False)
    if q:
        grp_names = [org["name"] for org in orgs if q in org["name"]]
    else:
        grp_names = [org["name"] for org in orgs]
        results = get_hierarchy_group(context, grp_names, "group", q)
    return results


@logic.side_effect_free
def organization_list_for_user_wri(context: Context, data_dict: DataDict):
    orgs = get_action("organization_list_for_user")(context, data_dict)
    q = data_dict.get("q", False)
    if q:
        orgs = [org["name"] for org in orgs if q in org["name"]]
    else:
        orgs = [org["name"] for org in orgs]
    results = get_hierarchy_group(context, orgs, "organization", q)
    return results


@logic.side_effect_free
def issue_search_wri(context: Context, data_dict: DataDict):
    issues = get_action("issue_search")(context, data_dict)
    issues = issues.get("results")
    results = []
    for issue in issues:
        issue = dict(issue)
        issue_details = get_action("issue_show")(
            context,
            {
                "issue_number": issue["number"],
                "dataset_id": issue["dataset_id"],
                "include_reports": False,
            },
        )
        results.append(issue_details)
    return results


@logic.side_effect_free
def package_collaborator_list_wri(context: Context, data_dict: DataDict):
    model = context["model"]

    package_id = _get_or_bust(data_dict, "id")

    package = model.Package.get(package_id)
    if not package:
        raise NotFound(_("Package not found"))

    _check_access("package_collaborator_list", context, data_dict)

    if not authz.check_config_permission("allow_dataset_collaborators"):
        raise ValidationError({"message": _("Dataset collaborators not enabled")})

    capacity = data_dict.get("capacity")

    allowed_capacities = authz.get_collaborator_capacities()
    if capacity and capacity not in allowed_capacities:
        raise ValidationError(
            {
                "message": _('Capacity must be one of "{}"').format(
                    ", ".join(allowed_capacities)
                )
            }
        )
    q = (
        model.Session.query(model.PackageMember, model.User)
        .filter(model.PackageMember.package_id == package.id)
        .filter(model.PackageMember.user_id == model.User.id)
    )

    if capacity:
        q = q.filter(model.PackageMember.capacity == capacity)

    collaborators = q.all()

    result = []
    for collaborator, user in collaborators:
        collaborator = collaborator.as_dict()
        user_dict = model_dictize.user_dictize(user, context)
        collaborator = {**collaborator, **user_dict}
        result.append(collaborator)

    return result


def get_geojson_from_filesystem(address: str):
    segments = address.split(",")
    cwd = os.path.abspath(os.path.dirname(__file__))
    if len(segments) == 1:
        path = os.path.join(
            cwd,
            "../../world_geojsons/countries/{}.geojson".format(segments[0].strip()),
        )
    else:
        path = os.path.join(
            cwd,
            "../../world_geojsons/states/{}/{}.geojson".format(
                segments[1].strip(), segments[0].strip()
            ),
        )

    with open(path, "r") as f:
        content = f.read()
        geojson = json.loads(content)
        geometries = []

        if geojson["type"] == "GeometryCollection":
            geometries = geojson["geometries"]
        elif geojson["type"] == "FeatureCollection":
            geometries = [x["geometry"] for x in geojson["features"]]
        else:
            geometries = [geojson]

        valid_geometries = []
        for geom in geometries:
            json_str = json.dumps(geom)
            shape = shapely.from_geojson(json_str)
            if shape.is_valid:
                valid_geometries.append(shape)

        merged_geometry = unary_union(valid_geometries)
        spatial_geom = geoalchemy2.functions.ST_GeomFromText(merged_geometry.wkt)
        print("Getting geojson from filesystem", flush=True)
        return spatial_geom


@logic.side_effect_free
def resource_search(context: Context, data_dict: DataDict):
    _check_access("resource_search", context, data_dict)

    model = context["model"]

    query = data_dict.get("query")
    order_by = data_dict.get("order_by")
    offset = data_dict.get("offset")
    limit = data_dict.get("limit")
    package_id = data_dict.get("package_id")
    is_pending = data_dict.get("is_pending")

    bbox = data_dict.get("bbox")
    spatial_address = data_dict.get("spatial_address")

    bbox_query = None
    if bbox and spatial_address is None:
        bbox_coordinates = bbox.split(",")

        if len(bbox_coordinates) != 4:
            raise ValidationError(
                {"bbox": _("bbox parameter must be 4 coordinates separated by comma")}
            )
        # NOTE: input must be lng lat lng lat
        bbox_geom = geoalchemy2.functions.ST_MakeEnvelope(*bbox_coordinates)

        bbox_query = geoalchemy2.functions.ST_Intersects(
            ResourceLocation.spatial_geom, bbox_geom
        )
        bbox_query = _or_(
            bbox_query,
            geoalchemy2.functions.ST_Intersects(
                ResourceLocation.spatial_coordinates, bbox_geom
            ),
        )

    point = data_dict.get("point")
    point_query = None
    if point:
        point = point.split(",")
        point_query = geoalchemy2.functions.ST_Intersects(
            ResourceLocation.spatial_geom, "POINT({} {})".format(*point)
        )

    # if query is None:
    #     raise ValidationError({'query': _('Missing value')})

    if isinstance(query, str):
        query = [query]

    if query is None:
        query = []

    try:
        fields = dict(pair.split(":", 1) for pair in query)
    except ValueError:
        pass
        # raise ValidationError(
        #     {'query': _('Must be <field>:<value> pair(s)')})

    q = (
        model.Session.query(model.Resource)
        .join(
            ResourceLocation,
            ResourceLocation.resource_id == model.Resource.id,
            isouter=True,
        )
        .join(Package, model.Package.id == model.Resource.package_id, isouter=True)
        .filter(model.Package.state == "active")
        .filter(model.Package.private == False)
        .filter(model.Package.name == package_id)
        .filter(model.Resource.state == "active")
    )
    location_queries = []
    if spatial_address:
        segments = spatial_address.split(",")
        if len(segments) == 3:
            full_address = (
                f"{segments[0].strip()}, {segments[1].strip()}, {segments[2].strip()}"
            )
            region = f"{segments[1].strip()}, {segments[2].strip()}"
            country = f"{segments[2].strip()}"
            location_queries.append(
                _or_(
                    ResourceLocation.spatial_address.like(f"{full_address}"),
                    ResourceLocation.spatial_address.like(f"{region}"),
                    ResourceLocation.spatial_address.like(f"{country}"),
                )
            )
        if len(segments) == 2:
            region = f"{segments[0].strip()}, {segments[1].strip()}"
            country = f"{segments[1].strip()}"
            location_queries.append(
                _or_(
                    ResourceLocation.spatial_address.like(f"%{region}"),
                    ResourceLocation.spatial_address.like(f"{country}"),
                )
            )
        if len(segments) == 1:
            country = f"{segments[0].strip()}"
            location_queries.append(
                ResourceLocation.spatial_address.like(f"%{country}"),
            )

        elif len(segments) == 3:
            # It's a city
            if point:
                location_queries.append(point_query)

        if point:
            try:
                shape = get_shape_from_dataapi(spatial_address, point)
                if shape:
                    shape = wkt.loads(shape)
                    spatial_geom = geoalchemy2.functions.ST_GeomFromText(shape.wkt)
                    location_queries.append(
                        geoalchemy2.functions.ST_Intersects(
                            ResourceLocation.spatial_geom, spatial_geom
                        )
                    )
            except Exception as e:
                log.error(e)

    if len(location_queries) == 0 and point_query is not None:
        location_queries.append(point_query)

    if bbox_query is not None:
        location_queries.append(bbox_query)

    if location_queries:
        q = q.filter(_or_(*location_queries))
        print(q, flush=True)

    resource_fields = model.Resource.get_columns()
    for field, term in fields.items():
        if field not in resource_fields:
            msg = _('Field "{field}" not recognised in resource_search.').format(
                field=field
            )

            # Running in the context of the internal search api.
            if context.get("search_query", False):
                raise search.SearchError(msg)

            # Otherwise, assume we're in the context of an external api
            # and need to provide meaningful external error messages.
            raise ValidationError({"query": msg})

        # prevent pattern injection
        term = misc.escape_sql_like_special_characters(term)

        model_attr = getattr(model.Resource, field)

        # Treat the has field separately, see docstring.
        if field == "hash":
            q = q.filter(model_attr.ilike(str(term) + "%"))

        # Resource extras are stored in a json blob.  So searching for
        # matching fields is a bit trickier. See the docstring.
        elif field in model.Resource.get_extra_columns():
            model_attr = getattr(model.Resource, "extras")

            like = _or_(
                model_attr.ilike("""%%"%s": "%%%s%%",%%""" % (field, term)),
                model_attr.ilike("""%%"%s": "%%%s%%"}""" % (field, term)),
            )
            q = q.filter(like)

        # Just a regular field
        else:
            column = model_attr.property.columns[0]
            if isinstance(column.type, sqlalchemy.UnicodeText):
                q = q.filter(model_attr.ilike("%" + str(term) + "%"))
            else:
                q = q.filter(model_attr == term)

    if order_by is not None:
        if hasattr(model.Resource, order_by):
            q = q.order_by(getattr(model.Resource, order_by))

    count = q.count()
    q = q.offset(offset)
    q = q.limit(limit)

    results = []
    for result in q:
        if isinstance(result, tuple) and isinstance(result[0], model.DomainObject):
            # This is the case for order_by rank due to the add_column.
            results.append(result[0])
        else:
            results.append(result)

    # If run in the context of a search query, then don't dictize the results.
    if not context.get("search_query", False):
        results = model_dictize.resource_list_dictize(results, context)

    # for i, result in enumerate(results):
    #     results[i].pop("spatial_geom")

    return {"count": count, "results": results}


# TODO:  customize package_show to include spatial_geom
# conditionally (optimization of the data file geo indexing)
