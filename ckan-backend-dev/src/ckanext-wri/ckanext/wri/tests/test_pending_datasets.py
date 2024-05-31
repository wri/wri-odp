import pytest

import ckan.tests.factories as factories
from ckan.logic import get_action
from ckan import model
import unittest.mock as mock


@mock.patch("ckan.plugins.toolkit.mail_user")
@pytest.mark.usefixtures("with_plugins", "test_request_context")
def test_pending_dataset_create(mail_user):
    user = factories.Sysadmin()
    dataset = factories.Dataset(
        notes="My dataset description",
        private=False,
        rw_dataset=True,
        title="My dataset",
        wri_data=False,
    )

    data_dict = {
        "package_id": dataset["id"],
        "package_data": dataset,
    }
    context = {
        "user": user["name"],
        "user_obj": user,
    }
    context["auth_user_obj"] = model.User.get(context["user"])
    data_dict["creator_id"] = model.User.get(context["user"]).id

    result = get_action("pending_dataset_create")(context, data_dict)

    assert result["package_id"] == dataset["id"]
    assert result["package_data"] == dataset


@mock.patch("ckan.plugins.toolkit.mail_user")
@pytest.mark.usefixtures("with_plugins", "test_request_context")
def test_pending_dataset_show(mail_user):
    user = factories.Sysadmin()
    dataset = factories.Dataset(
        notes="My dataset description",
        private=False,
        rw_dataset=True,
        title="My dataset",
        wri_data=False,
    )

    data_dict = {
        "package_id": dataset["id"],
        "package_data": dataset,
    }
    context = {
        "user": user["name"],
        "user_obj": user,
    }
    context["auth_user_obj"] = model.User.get(context["user"])
    data_dict["creator_id"] = model.User.get(context["user"]).id

    get_action("pending_dataset_create")(context, data_dict)

    result = get_action("pending_dataset_show")(context, {"package_id": dataset["id"]})

    assert result["package_id"] == dataset["id"]
    assert result["package_data"] == dataset


@mock.patch("ckan.plugins.toolkit.mail_user")
@pytest.mark.usefixtures("with_plugins", "test_request_context")
def test_pending_dataset_update(mail_user):
    user = factories.Sysadmin()
    dataset = factories.Dataset(
        notes="My dataset description",
        private=False,
        rw_dataset=True,
        title="My dataset",
        wri_data=False,
    )

    data_dict = {
        "package_id": dataset["id"],
        "package_data": dataset,
    }
    context = {
        "user": user["name"],
        "user_obj": user,
    }
    context["auth_user_obj"] = model.User.get(context["user"])
    data_dict["creator_id"] = model.User.get(context["user"]).id

    get_action("pending_dataset_create")(context, data_dict)

    result = get_action("pending_dataset_show")(context, {"package_id": dataset["id"]})

    assert result["package_id"] == dataset["id"]
    assert result["package_data"] == dataset

    dataset["title"] = "New Title"

    data_dict = {
        "package_id": dataset["id"],
        "package_data": dataset,
    }

    result = get_action("pending_dataset_update")(context, data_dict)

    assert result["package_id"] == dataset["id"]
    assert result["package_data"] == dataset
    assert result["package_data"]["title"] == "New Title"


@mock.patch("ckan.plugins.toolkit.mail_user")
@pytest.mark.usefixtures("with_plugins", "test_request_context")
def test_pending_dataset_delete(mail_user):
    user = factories.Sysadmin()
    dataset = factories.Dataset(
        notes="My dataset description",
        private=False,
        rw_dataset=True,
        title="My dataset",
        wri_data=False,
    )

    data_dict = {
        "package_id": dataset["id"],
        "package_data": dataset,
    }
    context = {
        "user": user["name"],
        "user_obj": user,
    }
    context["auth_user_obj"] = model.User.get(context["user"])

    get_action("pending_dataset_create")(context, data_dict)
    data_dict["creator_id"] = model.User.get(context["user"]).id

    result = get_action("pending_dataset_show")(context, {"package_id": dataset["id"]})

    assert result["package_id"] == dataset["id"]
    assert result["package_data"] == dataset

    get_action("pending_dataset_delete")(context, {"package_id": dataset["id"]})

    try:
        get_action("pending_dataset_show")(context, {"package_id": dataset["id"]})
    except Exception as e:
        assert e.message == f"Pending Dataset not found: {dataset['id']}"


@mock.patch("ckan.plugins.toolkit.mail_user")
@pytest.mark.usefixtures("with_plugins", "test_request_context")
def test_pending_diff_show(mail_user):
    userobj_sysadmin = factories.Sysadmin()
    session = model.Session
    context_sysadmin = {
        "model": model,
        "session": session,
        "user": userobj_sysadmin["name"],
        "user_obj": userobj_sysadmin,
    }
    dataset_public = {
        "type": "dataset",
        "title": "Test Dataset Schema",
        "name": f"public-dataset",
        "url": "http://example.com/dataset.json",
        "language": "en",
        "project": "American Cities Climate Challenge: Renewables Accelerator (U.S. Energy)",
        "application": "rw",
        "technical_notes": "http://example.com/technical_notes.pdf",
        "tag_string": "economy,mental health,government",
        "temporal_coverage_start": "2007",
        "temporal_coverage_end": "2011",
        "update_frequency": "annually",
        "citation": "Citation information",
        "visibility_type": "public",
        "license_id": "cc-by-4.0",
        "featured_dataset": True,
        "short_description": "A short description of the dataset",
        "private": False,
        "notes": "Some useful notes about the data",
        "author": "Joe Bloggs",
        "author_email": "joe@example.com",
        "maintainer": "Joe Bloggs",
        "maintainer_email": "joe@example.com",
        "function": "This data is used to...",
        "restrictions": "This data is restricted to...",
        "reason_for_adding": "This data is being added because...",
        "learn_more": "https://example.com/learn_more.pdf",
        "cautions": "This data should be used with caution because...",
        "methodology": "A short methodology of the dataset",
    }
    result_create_public = get_action("package_create")(
        context=context_sysadmin, data_dict=dataset_public
    )
    result_sysadmin_get_public = get_action("package_show")(
        context=context_sysadmin, data_dict={"id": result_create_public["name"]}
    )
    data_dict = {
        "package_id": result_sysadmin_get_public["id"],
        "package_data": result_sysadmin_get_public,
    }

    updated_dataset = result_sysadmin_get_public.copy()
    updated_dataset["title"] = "New Title"
    updated_dataset["notes"] = "New description"
    updated_dataset["rw_dataset"] = False
    updated_dataset["wri_data"] = True

    data_dict = {
        "package_id": result_sysadmin_get_public["id"],
        "package_data": updated_dataset,
    }

    get_action("pending_dataset_update")(context_sysadmin, data_dict)

    _result = get_action("pending_diff_show")(context_sysadmin, {"package_id": result_sysadmin_get_public["id"]})
    result = _result["diff"]

    assert result["title"]["new_value"] == "New Title"
    assert result["notes"]["new_value"] == "New description"
    assert result["private"]["new_value"] is True
    assert result["wri_data"]["new_value"] is True
