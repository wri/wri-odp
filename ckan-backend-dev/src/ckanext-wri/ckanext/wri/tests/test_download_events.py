import pytest
import unittest.mock as mock
import ckan.tests.factories as factories
from ckan.logic import get_action, ValidationError
from ckan import model

@mock.patch("ckan.plugins.toolkit.mail_user")
@pytest.mark.usefixtures("with_plugins", "test_request_context")
def test_download_event_create_basic(mail_user):
    """Test basic download event creation with minimal required fields"""
    # Setup test data
    user = factories.Sysadmin()
    organization = factories.Organization()
    dataset = factories.Dataset(owner_org=organization['id'])
    resource1 = factories.Resource(package_id=dataset['id'])
    resource2 = factories.Resource(package_id=dataset['id'])

    context = {
        "user": user["name"],
        "user_obj": user,
        "ignore_auth": True
    }

    # Create download events
    data_dict = {
        "package_id": dataset["id"],
        "resources": [resource1["id"], resource2["id"]],
        "email": "test@example.com",
        "affiliation": "Test Organization"
    }

    result = get_action("download_event_create")(context, data_dict)
    
    # Verify results
    assert len(result) == 2
    for event in result:
        assert event["email"] == "test@example.com"
        assert event["affiliation"] == "Test Organization"
        assert event["package"] == dataset["id"]
        assert event["resource_id"] in [resource1["id"], resource2["id"]]

@mock.patch("ckan.plugins.toolkit.mail_user") 
@pytest.mark.usefixtures("with_plugins", "test_request_context")
def test_download_event_create_all_fields(mail_user):
    """Test download event creation with all available fields"""
    # Setup test data
    user = factories.Sysadmin()
    organization = factories.Organization()
    dataset = factories.Dataset(owner_org=organization['id'])
    resource = factories.Resource(package_id=dataset['id'])

    context = {
        "user": user["name"],
        "user_obj": user,
        "ignore_auth": True
    }

    # Create download event with all fields
    data_dict = {
        "package_id": dataset["id"],
        "resources": [resource["id"]],
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User",
        "affiliation": "Test Organization",
        "organization": "Test Org",
        "job_title": "Researcher",
        "country": "United States",
        "interests": ["research", "data analysis"]
    }

    result = get_action("download_event_create")(context, data_dict)
    
    # Verify results
    assert len(result) == 1
    event = result[0]
    assert event["email"] == "test@example.com"
    assert event["first_name"] == "Test"
    assert event["last_name"] == "User"
    assert event["affiliation"] == "Test Organization"
    assert event["organization"] == "Test Org"
    assert event["job_title"] == "Researcher"
    assert event["country"] == "United States"
    assert event["interests"] == "research, data analysis"

@mock.patch("ckan.plugins.toolkit.mail_user")
@pytest.mark.usefixtures("with_plugins", "test_request_context")
def test_download_event_validation(mail_user):
    """Test validation of required fields for download events"""
    # Setup test data
    user = factories.Sysadmin()
    organization = factories.Organization()
    dataset = factories.Dataset(owner_org=organization['id'])
    resource = factories.Resource(package_id=dataset['id'])

    context = {
        "user": user["name"],
        "user_obj": user,
        "ignore_auth": True
    }

    # Test missing required fields
    required_fields = ["package_id", "resources", "email", "affiliation"]
    
    for field in required_fields:
        data_dict = {
            "package_id": dataset["id"],
            "resources": [resource["id"]],
            "email": "test@example.com",
            "affiliation": "Test Organization"
        }
        del data_dict[field]
        
        with pytest.raises(ValidationError) as excinfo:
            get_action("download_event_create")(context, data_dict)
        assert f"Missing required field {field}" in str(excinfo.value)

@mock.patch("ckan.plugins.toolkit.mail_user")
@pytest.mark.usefixtures("with_plugins", "test_request_context")
def test_download_event_list(mail_user):
    """Test listing download events with various filters"""
    # Setup test data
    user = factories.Sysadmin()
    org1 = factories.Organization()
    org2 = factories.Organization()
    
    dataset1 = factories.Dataset(owner_org=org1['id'])
    dataset2 = factories.Dataset(owner_org=org2['id'])
    
    resource1 = factories.Resource(package_id=dataset1['id'])
    resource2 = factories.Resource(package_id=dataset2['id'])

    context = {
        "user": user["name"],
        "user_obj": user,
        "ignore_auth": True
    }

    # Create some download events
    event_data1 = {
        "package_id": dataset1["id"],
        "resources": [resource1["id"]],
        "email": "test1@example.com",
        "affiliation": "Org 1"
    }

    event_data2 = {
        "package_id": dataset2["id"],
        "resources": [resource2["id"]],
        "email": "test2@example.com",
        "affiliation": "Org 2"
    }

    get_action("download_event_create")(context, event_data1)
    get_action("download_event_create")(context, event_data2)

    # Test listing all events as sysadmin
    all_events = get_action("download_event_list")(context, {})
    assert len(all_events) >= 2

    # Test listing events for specific organization
    org1_events = get_action("download_event_list")(context, {"owner_org": org1["id"]})
    assert len(org1_events) >= 1
    for event in org1_events:
        assert event["package"] == dataset1["id"]

    # Test CSV output format
    csv_data = get_action("download_event_list")(context, {"format": "csv"})
    assert isinstance(csv_data, str)
    assert "email,first_name,last_name" in csv_data
    assert "test1@example.com" in csv_data

@mock.patch("ckan.plugins.toolkit.mail_user")
@pytest.mark.usefixtures("with_plugins", "test_request_context")
def test_download_event_authorization(mail_user):
    """Test authorization rules for download events"""
    # Setup test data
    sysadmin = factories.Sysadmin()
    org_admin = factories.User()
    org = factories.Organization(
        users=[{"name": org_admin["name"], "capacity": "admin"}]
    )
    dataset = factories.Dataset(owner_org=org["id"])
    resource = factories.Resource(package_id=dataset["id"])

    # Context for different user types
    sysadmin_context = {
        "user": sysadmin["name"],
        "ignore_auth": False
    }
    
    org_admin_context = {
        "user": org_admin["name"],
        "ignore_auth": False
    }

    # Create a download event
    event_data = {
        "package_id": dataset["id"],
        "resources": [resource["id"]],
        "email": "test@example.com",
        "affiliation": "Test Org"
    }

    # Test that org admin can create download events
    result = get_action("download_event_create")(
        org_admin_context, event_data
    )
    assert len(result) == 1

    # Test listing events - org admin should only see their org's events
    org_events = get_action("download_event_list")(
        org_admin_context, {"owner_org": org["id"]}
    )
    assert len(org_events) >= 1

    # Test that org admin cannot see events from other orgs
    other_org = factories.Organization()
    with pytest.raises(ValidationError):
        get_action("download_event_list")(
            org_admin_context, {"owner_org": other_org["id"]}
        )
