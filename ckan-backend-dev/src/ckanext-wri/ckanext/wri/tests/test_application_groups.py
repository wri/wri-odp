import pytest

import ckan.tests.factories as factories
from ckan.logic import get_action
from ckan import model
import unittest.mock as mock
from ckan.logic import ValidationError


@mock.patch("ckan.plugins.toolkit.mail_user")
@pytest.mark.usefixtures("with_plugins", "test_request_context")
def test_application_group_create_all_fields(mail_user):
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

    application_group = {
        "name": "test-application-group-schema",
        "title": "Test Application Group Schema",
        "description": "A description of the application group",
        "homepage_url": "http://example.com",
        "help_url": "http://example.com/help",
        "contact_url": "http://example.com/contact",
        "image_url": "http://example.com/image",
        "type": "application",
    }

    try:
        get_action("group_purge")(
            context={"ignore_auth": True}, data_dict={"id": application_group["name"]}
        )
    except Exception:
        pass

    application_group = get_action("group_create")(context, application_group)
    application_group = get_action("group_show")(
        context, {"id": application_group["name"]}
    )

    assert application_group["name"] == "test-application-group-schema"
    assert application_group["title"] == "Test Application Group Schema"
    assert application_group["description"] == "A description of the application group"
    assert application_group["homepage_url"] == "http://example.com"
    assert application_group["help_url"] == "http://example.com/help"
    assert application_group["contact_url"] == "http://example.com/contact"
    assert application_group["image_url"] == "http://example.com/image"
    assert application_group["type"] == "application"

    get_action("group_purge")(
        context={"ignore_auth": True}, data_dict={"id": application_group["name"]}
    )


@mock.patch("ckan.plugins.toolkit.mail_user")
@pytest.mark.usefixtures("with_plugins", "test_request_context")
def test_application_group_update_all_fields(mail_user):
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

    application_group = {
        "name": "test-application-group-schema",
        "title": "Test Application Group Schema",
        "description": "A description of the application group",
        "homepage_url": "http://example.com",
        "help_url": "http://example.com/help",
        "contact_url": "http://example.com/contact",
        "image_url": "http://example.com/image",
        "type": "application",
    }

    try:
        get_action("group_purge")(
            context={"ignore_auth": True}, data_dict={"id": application_group["name"]}
        )
    except Exception:
        pass

    application_group = get_action("group_create")(context, application_group)

    application_group = get_action("group_update")(
        context,
        {
            "id": application_group["id"],
            "name": application_group["name"],
            "title": "New Title",
            "description": "New Description",
            "homepage_url": "http://new.example.com",
            "help_url": "http://new.example.com/help",
            "contact_url": "http://new.example.com/contact",
            "image_url": "http://new.example.com/image",
        },
    )

    application_group = get_action("group_show")(
        context, {"id": application_group["id"]}
    )

    assert application_group["name"] == "test-application-group-schema"
    assert application_group["title"] == "New Title"
    assert application_group["description"] == "New Description"
    assert application_group["homepage_url"] == "http://new.example.com"
    assert application_group["help_url"] == "http://new.example.com/help"
    assert application_group["contact_url"] == "http://new.example.com/contact"
    assert application_group["image_url"] == "http://new.example.com/image"
    assert application_group["type"] == "application"

    get_action("group_purge")(
        context={"ignore_auth": True}, data_dict={"id": application_group["name"]}
    )


@mock.patch("ckan.plugins.toolkit.mail_user")
@pytest.mark.usefixtures("with_plugins", "test_request_context")
def test_application_group_validators(mail_user):
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

    url_fields = ["homepage_url", "help_url", "contact_url"]

    application_group = {
        "name": "test-application-group-schema",
        "title": "Test Application Group Schema",
        "description": "A description of the application group",
        "homepage_url": "http://example.com",
        "help_url": "http://example.com/help",
        "contact_url": "http://example.com/contact",
        "image_url": "http://example.com/image",
        "type": "application",
    }

    for field in url_fields:
        application_group[field] = "not a URL"

        with pytest.raises(ValidationError):
            get_action("group_create")(context, application_group)

        application_group[field] = f"http://example.com/{field}"

    application_group = get_action("group_create")(context, application_group)
    application_group = get_action("group_show")(
        context, {"id": application_group["id"]}
    )

    assert application_group["name"] == "test-application-group-schema"
    assert application_group["title"] == "Test Application Group Schema"
    assert application_group["description"] == "A description of the application group"
    assert application_group["homepage_url"] == "http://example.com/homepage_url"
    assert application_group["help_url"] == "http://example.com/help_url"
    assert application_group["contact_url"] == "http://example.com/contact_url"
    assert application_group["image_url"] == "http://example.com/image"
    assert application_group["type"] == "application"

    get_action("group_purge")(
        context={"ignore_auth": True}, data_dict={"id": application_group["name"]}
    )


@mock.patch("ckan.plugins.toolkit.mail_user")
@pytest.mark.usefixtures("with_plugins", "test_request_context")
def test_application_group_required_fields(mail_user):
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

    required_fields = ["name", "title", "description", "homepage_url"]

    valid_field_values = {
        "name": "test-application-group-schema",
        "title": "Test Application Group Schema",
        "description": "A description of the application group",
        "homepage_url": "http://example.com",
    }

    application_group = {
        "name": "test-application-group-schema",
        "title": "Test Application Group Schema",
        "description": "A description of the application group",
        "homepage_url": "http://example.com",
        "help_url": "http://example.com/help",
        "contact_url": "http://example.com/contact",
        "image_url": "http://example.com/image",
        "type": "application",
    }

    try:
        get_action("group_purge")(
            context={"ignore_auth": True}, data_dict={"id": application_group["name"]}
        )
    except Exception:
        pass

    for field in required_fields:
        del application_group[field]

        with pytest.raises(ValidationError):
            get_action("group_create")(context, application_group)

        application_group[field] = valid_field_values[field]

    application_group = get_action("group_create")(context, application_group)
    application_group = get_action("group_show")(
        context, {"id": application_group["id"]}
    )

    assert application_group["name"] == "test-application-group-schema"
    assert application_group["title"] == "Test Application Group Schema"
    assert application_group["description"] == "A description of the application group"
    assert application_group["homepage_url"] == "http://example.com"
    assert application_group["help_url"] == "http://example.com/help"
    assert application_group["contact_url"] == "http://example.com/contact"
    assert application_group["image_url"] == "http://example.com/image"
    assert application_group["type"] == "application"

    get_action("group_purge")(
        context={"ignore_auth": True}, data_dict={"id": application_group["name"]}
    )
