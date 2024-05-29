import pytest

from ckan.logic import NotFound, get_action, ValidationError
from ckan import model
import ckan.tests.factories as factories
from ckan.logic import get_action


@pytest.mark.usefixtures("with_plugins", "test_request_context")
def test_search_queries():
    userobj = factories.Sysadmin()
    session = model.Session
    context = {
        "model": model,
        "session": session,
        "user": userobj["name"],
        "ignore_auth": True,
        "user_obj": userobj,
    }
    context["auth_user_obj"] = model.User.get(context["user"])

    organization_dict = factories.Organization()
    group_dict = factories.Group()

    dataset = {
        "type": "dataset",
        "title": "Test Dataset Schema",
        "name": "test-dataset-schema",
        "url": "http://example.com/dataset.json",
        "language": "en",
        "owner_org": organization_dict["id"],
        "project": "American Cities Climate Challenge: Renewables Accelerator (U.S. Energy)",
        "application": "rw app",
        "groups": [{"id": group_dict["id"]}],
        "technical_notes": "http://example.com/technical_notes.pdf",
        "tag_string": "economy,mental health,government",
        # 'temporal_coverage_start': '2007',
        # 'temporal_coverage_end': '2011',
        "update_frequency": "annually",
        "citation": "Citation information",
        "visibility_type": "public",
        "license_id": "cc-by-4.0",
        "featured_dataset": True,
        "short_description": "A short description of the dataset",
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

    try:
        get_action("package_delete")(
            context={"ignore_auth": True}, data_dict={"id": dataset["name"]}
        )
    except NotFound:
        pass

    result = get_action("package_create")(context=context, data_dict=dataset)

    fields_to_test = [
        "language",
        "project",
        "application",
        "technical_notes",
        # 'temporal_coverage_start', 'temporal_coverage_end',
        "update_frequency",
        "citation",
        "visibility_type",
        "featured_dataset",
        "short_description",
        "function",
        "restrictions",
        "reason_for_adding",
        "learn_more",
        "cautions",
        "methodology",
    ]

    # Test that correct queries return the dataset
    for field in fields_to_test:
        if field in ["featured_dataset", "wri_data", "draft"]:
            result = get_action("package_search")(
                context=context, data_dict={"q": f"{field}:{dataset[field]}"}
            )["results"]

            assert result[0]["name"] == dataset["name"]

        else:
            result = get_action("package_search")(
                context=context, data_dict={"q": f'{field}:"{dataset[field]}"'}
            )["results"]

            assert result[0]["name"] == dataset["name"]

    # Test that incorrect queries do not return the dataset
    for field in fields_to_test:
        if field in ["featured_dataset", "wri_data", "draft"]:
            result = get_action("package_search")(
                context=context, data_dict={"q": f"{field}:false"}
            )["results"]

            if len(result) > 0:
                assert result[0]["name"] != dataset["name"]

        else:
            result = get_action("package_search")(
                context=context, data_dict={"q": f'{field}:"not a value"'}
            )["results"]

            if len(result) > 0:
                assert result[0]["name"] != dataset["name"]

    try:
        get_action("package_delete")(
            context={"ignore_auth": True}, data_dict={"id": dataset["name"]}
        )
    except NotFound:
        pass
