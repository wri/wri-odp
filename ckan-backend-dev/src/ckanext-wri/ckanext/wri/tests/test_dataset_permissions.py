import pytest

from ckan.logic import NotFound, NotAuthorized, get_action, ValidationError
from ckan import model
import ckan.tests.factories as factories
import unittest.mock as mock
import uuid

@mock.patch("ckan.plugins.toolkit.mail_user")
@pytest.mark.usefixtures("with_plugins", "test_request_context")
def test_package_create_public(mail_user):
    organization_dict = factories.Organization()
    group_dict = factories.Group()

    userobj_sysadmin = factories.Sysadmin()
    userobj_org_admin = factories.User()
    userobj_org_editor = factories.User()
    userobj_org_member = factories.User()
    userobj_general = factories.User()

    session = model.Session
    context_sysadmin = {
        "model": model,
        "session": session,
        "user": userobj_sysadmin["name"],
        "user_obj": userobj_sysadmin,
    }
    context_sysadmin["auth_user_obj"] = model.User.get(context_sysadmin["user"])

    context_org_admin = {
        "model": model,
        "session": session,
        "user": userobj_org_admin["name"],
        "user_obj": userobj_org_admin,
    }
    context_org_admin["auth_user_obj"] = model.User.get(context_org_admin["user"])

    context_org_editor = {
        "model": model,
        "session": session,
        "user": userobj_org_editor["name"],
        "user_obj": userobj_org_editor,
    }
    context_org_editor["auth_user_obj"] = model.User.get(context_org_editor["user"])

    context_org_member = {
        "model": model,
        "session": session,
        "user": userobj_org_member["name"],
        "user_obj": userobj_org_member,
    }
    context_org_member["auth_user_obj"] = model.User.get(context_org_member["user"])

    context_general = {
        "model": model,
        "session": session,
        "user": userobj_general["name"],
        "user_obj": userobj_general,
    }
    context_general["auth_user_obj"] = model.User.get(context_general["user"])

    get_action("organization_member_create")(
        context=context_sysadmin,
        data_dict={
            "id": organization_dict["id"],
            "username": userobj_org_admin["name"],
            "role": "admin",
        },
    )

    get_action("organization_member_create")(
        context=context_sysadmin,
        data_dict={
            "id": organization_dict["id"],
            "username": userobj_org_editor["name"],
            "role": "editor",
        },
    )

    get_action("organization_member_create")(
        context=context_sysadmin,
        data_dict={
            "id": organization_dict["id"],
            "username": userobj_org_member["name"],
            "role": "member",
        },
    )

    dataset_public = {
        "type": "dataset",
        "title": "Test Dataset Schema",
        "name": f"public-dataset-{str(uuid.uuid4())}",
        "url": "http://example.com/dataset.json",
        "language": "en",
        "owner_org": organization_dict["id"],
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
        delete_public = get_action("dataset_purge")(
            context={"ignore_auth": True}, data_dict={"id": dataset_public["name"]}
        )
    except NotFound:
        pass

    result_create_public = get_action("package_create")(
        context=context_sysadmin, data_dict=dataset_public
    )
    result_approve_public = get_action("approve_pending_dataset")(
        context=context_sysadmin, data_dict={"dataset_id": result_create_public["id"]}
    )

    # Sysadmin

    result_sysadmin_get_public = get_action("package_show")(
        context=context_sysadmin, data_dict={"id": result_create_public["name"]}
    )

    assert result_sysadmin_get_public["name"] == dataset_public["name"]

    # Org admin

    result_org_admin_get_public = get_action("package_show")(
        context=context_org_admin, data_dict={"id": result_create_public["name"]}
    )

    assert result_org_admin_get_public["name"] == dataset_public["name"]

    # Org editor

    result_org_editor_get_public = get_action("package_show")(
        context=context_org_editor, data_dict={"id": result_create_public["name"]}
    )

    assert result_org_editor_get_public["name"] == dataset_public["name"]

    # Org member

    result_general_get_public = get_action("package_show")(
        context=context_org_member, data_dict={"id": result_create_public["name"]}
    )

    assert result_general_get_public["name"] == dataset_public["name"]

    # General user

    result_general_get_public = get_action("package_show")(
        context=context_general, data_dict={"id": result_create_public["name"]}
    )

    assert result_general_get_public["name"] == dataset_public["name"]

    # Anon user

    result_anon_get_public = get_action("package_show")(
        context=context_general, data_dict={"id": result_create_public["name"]}
    )

    assert result_anon_get_public["name"] == dataset_public["name"]

    try:
        get_action("package_delete")(
            context={"ignore_auth": True}, data_dict={"id": dataset_public["name"]}
        )
    except NotFound:
        pass

@mock.patch("ckan.plugins.toolkit.mail_user")
@pytest.mark.usefixtures("with_plugins", "test_request_context")
def test_package_create_draft(mail_user):
    organization_dict = factories.Organization()
    group_dict = factories.Group()

    userobj_sysadmin = factories.Sysadmin()
    userobj_org_admin = factories.User()
    userobj_org_editor = factories.User()
    userobj_org_member = factories.User()
    userobj_general = factories.User()

    session = model.Session
    context_sysadmin = {
        "model": model,
        "session": session,
        "user": userobj_sysadmin["name"],
        "user_obj": userobj_sysadmin,
    }
    context_sysadmin["auth_user_obj"] = model.User.get(context_sysadmin["user"])

    context_org_admin = {
        "model": model,
        "session": session,
        "user": userobj_org_admin["name"],
        "user_obj": userobj_org_admin,
    }
    context_org_admin["auth_user_obj"] = model.User.get(context_org_admin["user"])

    context_org_editor = {
        "model": model,
        "session": session,
        "user": userobj_org_editor["name"],
        "user_obj": userobj_org_editor,
    }
    context_org_editor["auth_user_obj"] = model.User.get(context_org_editor["user"])

    context_org_member = {
        "model": model,
        "session": session,
        "user": userobj_org_member["name"],
        "user_obj": userobj_org_member,
    }
    context_org_member["auth_user_obj"] = model.User.get(context_org_member["user"])

    context_general = {
        "model": model,
        "session": session,
        "user": userobj_general["name"],
        "user_obj": userobj_general,
    }
    context_general["auth_user_obj"] = model.User.get(context_general["user"])

    get_action("organization_member_create")(
        context=context_sysadmin,
        data_dict={
            "id": organization_dict["id"],
            "username": userobj_org_admin["name"],
            "role": "admin",
        },
    )

    get_action("organization_member_create")(
        context=context_sysadmin,
        data_dict={
            "id": organization_dict["id"],
            "username": userobj_org_editor["name"],
            "role": "editor",
        },
    )

    get_action("organization_member_create")(
        context=context_sysadmin,
        data_dict={
            "id": organization_dict["id"],
            "username": userobj_org_member["name"],
            "role": "member",
        },
    )

    dataset_draft = {
        "type": "dataset",
        "title": "Test Dataset Schema",
        "name": f"public-dataset-{str(uuid.uuid4())}",
        "url": "http://example.com/dataset.json",
        "language": "en",
        "owner_org": organization_dict["id"],
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

    dataset_draft["draft"] = True
    dataset_draft["visibility_type"] = "draft"
    dataset_draft["name"] = f"draft-dataset-{str(uuid.uuid4())}"

    try:
        delete_draft = get_action("dataset_purge")(
            context={"ignore_auth": True}, data_dict={"id": dataset_draft["name"]}
        )
    except NotFound:
        pass
    
    result_create_draft = get_action("package_create")(
        context=context_org_editor, data_dict=dataset_draft
    )

    # Sysadmin

    result_sysadmin_get_draft = get_action("package_show")(
        context=context_sysadmin, data_dict={"id": result_create_draft["name"]}
    )

    assert result_sysadmin_get_draft["name"] == dataset_draft["name"]

   # Org admin

    with pytest.raises(NotAuthorized) as excinfo:
        result_org_admin_get_draft = get_action("package_show")(
            context=context_org_admin, data_dict={"id": result_create_draft["name"]}
        )
        __import__('pprint').pprint(result_org_admin_get_draft)
    assert "not authorized" in str(excinfo.value)

    # Org editor

    result_org_editor_get_draft = get_action("package_show")(
        context=context_org_editor, data_dict={"id": result_create_draft["name"]}
    )

    assert result_org_editor_get_draft["name"] == dataset_draft["name"]

    # Org member

    with pytest.raises(NotAuthorized) as excinfo:
        result_general_get_draft = get_action("package_show")(
            context=context_org_member, data_dict={"id": result_create_draft["name"]}
        )

    assert "not authorized" in str(excinfo.value)

   # General user

    with pytest.raises(NotAuthorized) as excinfo:
        result_general_get_draft = get_action("package_show")(
            context=context_general, data_dict={"id": result_create_draft["name"]}
        )

    assert "not authorized" in str(excinfo.value)

    # Anon user

    with pytest.raises(NotAuthorized) as excinfo:
        result_anon_get_draft = get_action("package_show")(
            data_dict={"id": result_create_draft["name"]}
        )
    assert "not authorized" in str(excinfo.value)

    try:
        get_action("package_delete")(
            context={"ignore_auth": True}, data_dict={"id": dataset_draft["name"]}
        )
    except NotFound:
        pass

@mock.patch("ckan.plugins.toolkit.mail_user")
@pytest.mark.usefixtures("with_plugins", "test_request_context")
def test_package_create_internal(mail_user):
    organization_dict = factories.Organization()
    group_dict = factories.Group()

    userobj_sysadmin = factories.Sysadmin()
    userobj_org_admin = factories.User()
    userobj_org_editor = factories.User()
    userobj_org_member = factories.User()
    userobj_general = factories.User()

    session = model.Session
    context_sysadmin = {
        "model": model,
        "session": session,
        "user": userobj_sysadmin["name"],
        "user_obj": userobj_sysadmin,
    }
    context_sysadmin["auth_user_obj"] = model.User.get(context_sysadmin["user"])

    context_org_admin = {
        "model": model,
        "session": session,
        "user": userobj_org_admin["name"],
        "user_obj": userobj_org_admin,
    }
    context_org_admin["auth_user_obj"] = model.User.get(context_org_admin["user"])

    context_org_editor = {
        "model": model,
        "session": session,
        "user": userobj_org_editor["name"],
        "user_obj": userobj_org_editor,
    }
    context_org_editor["auth_user_obj"] = model.User.get(context_org_editor["user"])

    context_org_member = {
        "model": model,
        "session": session,
        "user": userobj_org_member["name"],
        "user_obj": userobj_org_member,
    }
    context_org_member["auth_user_obj"] = model.User.get(context_org_member["user"])

    context_general = {
        "model": model,
        "session": session,
        "user": userobj_general["name"],
        "user_obj": userobj_general,
    }
    context_general["auth_user_obj"] = model.User.get(context_general["user"])

    get_action("organization_member_create")(
        context=context_sysadmin,
        data_dict={
            "id": organization_dict["id"],
            "username": userobj_org_admin["name"],
            "role": "admin",
        },
    )

    get_action("organization_member_create")(
        context=context_sysadmin,
        data_dict={
            "id": organization_dict["id"],
            "username": userobj_org_editor["name"],
            "role": "editor",
        },
    )

    get_action("organization_member_create")(
        context=context_sysadmin,
        data_dict={
            "id": organization_dict["id"],
            "username": userobj_org_member["name"],
            "role": "member",
        },
    )

    dataset_internal = {
        "type": "dataset",
        "title": "Test Dataset Schema",
        "name": f"public-dataset-{str(uuid.uuid4())}",
        "url": "http://example.com/dataset.json",
        "language": "en",
        "owner_org": organization_dict["id"],
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

    dataset_internal["visibility_type"] = "internal"
    dataset_internal["name"] = "internal-dataset"
    dataset_internal["name"] = f"internal-dataset-{str(uuid.uuid4())}"

    try:
        delete_internal = get_action("dataset_purge")(
            context={"ignore_auth": True}, data_dict={"id": dataset_internal["name"]}
        )
    except NotFound:
        pass


    result_create_internal = get_action("package_create")(
        context=context_sysadmin, data_dict=dataset_internal
    )

    result_approve_internal = get_action("approve_pending_dataset")(
        context=context_sysadmin, data_dict={"dataset_id": result_create_internal["id"]}
    )

    # Sysadmin

    result_sysadmin_get_internal = get_action("package_show")(
        context=context_sysadmin, data_dict={"id": result_create_internal["name"]}
    )

    assert result_sysadmin_get_internal["name"] == dataset_internal["name"]

    # Org admin

    result_org_admin_get_internal = get_action("package_show")(
        context=context_org_admin, data_dict={"id": result_create_internal["name"]}
    )

    assert result_org_admin_get_internal["name"] == dataset_internal["name"]

    # Org editor

    result_org_editor_get_internal = get_action("package_show")(
        context=context_org_editor, data_dict={"id": result_create_internal["name"]}
    )

    assert result_org_editor_get_internal["name"] == dataset_internal["name"]

    # Org member

    result_general_get_internal = get_action("package_show")(
        context=context_org_member, data_dict={"id": result_create_internal["name"]}
    )

    assert result_general_get_internal["name"] == dataset_internal["name"]

    # General user

    result_general_get_internal = get_action("package_show")(
        context=context_general, data_dict={"id": result_create_internal["name"]}
    )

    assert result_general_get_internal["name"] == dataset_internal["name"]

    # Anon user

    with pytest.raises(NotAuthorized) as excinfo:
        result_anon_get_internal = get_action("package_show")(
            data_dict={"id": result_create_internal["name"]}
        )
    assert "not authorized" in str(excinfo.value)

    try:
        get_action("package_delete")(
            context={"ignore_auth": True}, data_dict={"id": dataset_internal["name"]}
        )
    except NotFound:
        pass

@mock.patch("ckan.plugins.toolkit.mail_user")
@pytest.mark.usefixtures("with_plugins", "test_request_context")
def test_package_create_private(mail_user):
    organization_dict = factories.Organization()
    group_dict = factories.Group()

    userobj_sysadmin = factories.Sysadmin()
    userobj_org_admin = factories.User()
    userobj_org_editor = factories.User()
    userobj_org_member = factories.User()
    userobj_general = factories.User()

    session = model.Session
    context_sysadmin = {
        "model": model,
        "session": session,
        "user": userobj_sysadmin["name"],
        "user_obj": userobj_sysadmin,
    }
    context_sysadmin["auth_user_obj"] = model.User.get(context_sysadmin["user"])

    context_org_admin = {
        "model": model,
        "session": session,
        "user": userobj_org_admin["name"],
        "user_obj": userobj_org_admin,
    }
    context_org_admin["auth_user_obj"] = model.User.get(context_org_admin["user"])

    context_org_editor = {
        "model": model,
        "session": session,
        "user": userobj_org_editor["name"],
        "user_obj": userobj_org_editor,
    }
    context_org_editor["auth_user_obj"] = model.User.get(context_org_editor["user"])

    context_org_member = {
        "model": model,
        "session": session,
        "user": userobj_org_member["name"],
        "user_obj": userobj_org_member,
    }
    context_org_member["auth_user_obj"] = model.User.get(context_org_member["user"])

    context_general = {
        "model": model,
        "session": session,
        "user": userobj_general["name"],
        "user_obj": userobj_general,
    }
    context_general["auth_user_obj"] = model.User.get(context_general["user"])

    get_action("organization_member_create")(
        context=context_sysadmin,
        data_dict={
            "id": organization_dict["id"],
            "username": userobj_org_admin["name"],
            "role": "admin",
        },
    )

    get_action("organization_member_create")(
        context=context_sysadmin,
        data_dict={
            "id": organization_dict["id"],
            "username": userobj_org_editor["name"],
            "role": "editor",
        },
    )

    get_action("organization_member_create")(
        context=context_sysadmin,
        data_dict={
            "id": organization_dict["id"],
            "username": userobj_org_member["name"],
            "role": "member",
        },
    )

    dataset_private = {
        "type": "dataset",
        "title": "Test Dataset Schema",
        "name": f"private-dataset-{str(uuid.uuid4())}",
        "url": "http://example.com/dataset.json",
        "language": "en",
        "owner_org": organization_dict["id"],
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

    dataset_private["visibility_type"] = "private"
    dataset_private["name"] = "private-dataset"
    dataset_private["name"] = f"private-dataset-{str(uuid.uuid4())}"

    try:
        delete_private = get_action("dataset_purge")(
            context={"ignore_auth": True}, data_dict={"id": dataset_private["name"]}
        )
    except NotFound:
        pass

    result_create_private = get_action("package_create")(
        context=context_sysadmin, data_dict=dataset_private
    )


    # Sysadmin

    result_sysadmin_get_private = get_action("package_show")(
        context=context_sysadmin, data_dict={"id": result_create_private["name"]}
    )

    assert result_sysadmin_get_private["name"] == dataset_private["name"]

    # Org admin

    result_org_admin_get_private = get_action("package_show")(
        context=context_org_admin, data_dict={"id": result_create_private["name"]}
    )

    assert result_org_admin_get_private["name"] == dataset_private["name"]

    # Org editor

    result_org_editor_get_private = get_action("package_show")(
        context=context_org_editor, data_dict={"id": result_create_private["name"]}
    )

    assert result_org_editor_get_private["name"] == dataset_private["name"]

    # Org member

    result_general_get_private = get_action("package_show")(
        context=context_org_member, data_dict={"id": result_create_private["name"]}
    )

    assert result_general_get_private["name"] == dataset_private["name"]

    # General user

    with pytest.raises(NotAuthorized) as excinfo:
        result_general_get_private = get_action("package_show")(
            context=context_general, data_dict={"id": result_create_private["name"]}
        )

    assert "not authorized" in str(excinfo.value)

    # Anon user

    with pytest.raises(NotAuthorized) as excinfo:
        result_anon_get_private = get_action("package_show")(
            data_dict={"id": result_create_private["name"]}
        )

    assert "not authorized" in str(excinfo.value)

    try:
        get_action("package_delete")(
            context={"ignore_auth": True}, data_dict={"id": dataset_private["name"]}
        )
    except NotFound:
        pass
