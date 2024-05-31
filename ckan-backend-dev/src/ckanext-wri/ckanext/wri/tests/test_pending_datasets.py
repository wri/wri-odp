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
   context['auth_user_obj'] = model.User.get(context['user'])
   data_dict['creator_id'] = model.User.get(context['user']).id

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
   context['auth_user_obj'] = model.User.get(context['user'])
   data_dict['creator_id'] = model.User.get(context['user']).id

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
   context['auth_user_obj'] = model.User.get(context['user'])
   data_dict['creator_id'] = model.User.get(context['user']).id

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
   context['auth_user_obj'] = model.User.get(context['user'])

   get_action("pending_dataset_create")(context, data_dict)
   data_dict['creator_id'] = model.User.get(context['user']).id

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
    user = factories.Sysadmin()
    session = model.Session
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
        'model': model, 'session': session,
        'user': user['name'], 'ignore_auth': True,
        'user_obj': user
    }
    context['auth_user_obj'] = model.User.get(context['user'])

    get_action("pending_dataset_create")(context, data_dict)
    data_dict['creator_id'] = model.User.get(context['user']).id

    updated_dataset = dataset.copy()
    updated_dataset["title"] = "New Title"
    updated_dataset["notes"] = "New description"
    updated_dataset["rw_dataset"] = False
    updated_dataset["wri_data"] = True

    data_dict = {
        "package_id": dataset["id"],
        "package_data": updated_dataset,
    }

    get_action("pending_dataset_update")(context, data_dict)

    _result = get_action("pending_diff_show")(context, {"package_id": dataset["id"]})
    result = _result['diff']

    assert result["title"]["new_value"] == "New Title"
    assert result["notes"]["new_value"] == "New description"
    assert result["private"]["new_value"] is True
    assert result["rw_dataset"]["new_value"] is False
    assert result["wri_data"]["new_value"] is True
