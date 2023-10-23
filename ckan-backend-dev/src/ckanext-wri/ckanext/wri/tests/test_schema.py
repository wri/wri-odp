import pytest

from ckanapi import RemoteCKAN

from ckan.logic import NotFound, get_action, ValidationError
from ckan.common import config
import ckan.lib.navl.dictization_functions as df
from ckan import model
import ckan.tests.factories as factories
from ckan.logic import get_action

Invalid = df.Invalid


@pytest.mark.usefixtures(u"with_plugins", u"test_request_context")
def test_package_create():
    userobj = factories.Sysadmin()
    session = model.Session
    context = {
        "model": model, "session": session,
        "user": userobj["name"], "ignore_auth": True,
        "user_obj": userobj
    }

    organization_dict = factories.Organization()
    group_dict = factories.Group()

    dataset = {
        "type": "dataset",
        "title": "Test Dataset Schema",
        "name": "test-dataset-schema",
        "url": "http://example.com/dataset.json",
        "language": "en",
        "owner_org": organization_dict["id"],
        "projects": ["wri", "gfw"],
        "application": "rw",
        "groups": [{"id": group_dict["id"]}],
        "technical_notes": "http://example.com/technical_notes.pdf",
        "tag_string": "economy,mental health,government",
        "temporal_coverage": "2007-2021",
        "update_frequency": "annually",
        "citation": "Citation information",
        "visibility_type": "draft",
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
        "summary": "A short summary of the dataset"
    }

    try:
        get_action("package_delete")(
            context={"ignore_auth": True},
            data_dict={"id": dataset["name"]}
        )
    except NotFound:
        pass

    result = get_action("package_create")(
        context=context,
        data_dict=dataset
    )

    tag_string = dataset["tag_string"].split(",")

    assert result["title"] == dataset["title"]
    assert result["name"] == dataset["name"]
    assert result["url"] == dataset["url"]
    assert result["language"] == dataset["language"]
    assert result["owner_org"] == organization_dict["id"]
    assert result["projects"] == dataset["projects"]
    assert result["application"] == dataset["application"]
    assert result["groups"][0]["name"] == group_dict["name"]
    assert result["technical_notes"] == dataset["technical_notes"]
    assert all(
        tag["name"] in tag_string for tag in result["tags"]
    )
    assert result["temporal_coverage"] == dataset["temporal_coverage"]
    assert result["update_frequency"] == dataset["update_frequency"]
    assert result["citation"] == dataset["citation"]
    assert result["visibility_type"] == dataset["visibility_type"]
    assert result["license_id"] == dataset["license_id"]
    assert result["featured_dataset"] is True
    assert result["short_description"] == dataset["short_description"]
    assert result["notes"] == dataset["notes"]
    assert result["author"] == dataset["author"]
    assert result["author_email"] == dataset["author_email"]
    assert result["maintainer"] == dataset["maintainer"]
    assert result["maintainer_email"] == dataset["maintainer_email"]
    assert result["function"] == dataset["function"]
    assert result["restrictions"] == dataset["restrictions"]
    assert result["reason_for_adding"] == dataset["reason_for_adding"]
    assert result["learn_more"] == dataset["learn_more"]
    assert result["cautions"] == dataset["cautions"]
    assert result["summary"] == dataset["summary"]

    invalid_urls = ["invalid_url_1", "invalid_url_2", "invalid_url_3"]

    for field_name in ["url", "technical_notes", "learn_more"]:
        for invalid_url in invalid_urls:
            updated_dataset = dataset.copy()
            updated_dataset[field_name] = invalid_url

            with pytest.raises(ValidationError) as excinfo:
                get_action("package_update")(
                    context=context,
                    data_dict=updated_dataset
                )

            assert "Please provide a valid URL" in str(excinfo.value)

    invalid_language = "not a language"
    updated_dataset = dataset.copy()
    updated_dataset["language"] = invalid_language

    with pytest.raises(ValidationError) as excinfo:
        get_action("package_update")(
            context=context,
            data_dict=updated_dataset
        )

    assert "Value must be a valid ISO 639-1 language code" in str(excinfo.value)

    try:
        get_action("package_delete")(
            context={"ignore_auth": True},
            data_dict={"id": dataset["name"]}
        )
    except NotFound:
        pass
