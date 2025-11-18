import pytest

import ckanext.wri.logic.validators as validators
import ckan.lib.navl.dictization_functions as df
import ckan.plugins.toolkit as tk

Invalid = df.Invalid


# @pytest.mark.parametrize(
#    "value,expected",
#    [
#        (
#            "2019-01-01T00:00:00Z/2019-01-01T00:00:00Z",
#            "2019-01-01T00:00:00Z/2019-01-01T00:00:00Z"
#        ),
#        ("2019-01-01T00:00:00Z/2019-01-01T00:00:00", ValidationError),
#        ("2019-01-01/2019-01-01", "2019-01-01T00:00:00Z/2019-01-01T23:59:59Z"),
#        ("2019-01-01/2019-01-01T00:00:00Z", ValidationError)
#    ]
# )
# def test_iso_datetime_range(value, expected):
#    context = {}
#    if expected is ValidationError:
#        with pytest.raises(expected):
#            validators.iso_datetime_range(value, context)
#    else:
#        assert validators.iso_datetime_range(value, context) == expected


@pytest.mark.parametrize(
    "value,expected",
    [
        ("en", "en"),
        ("EN", "EN"),
        ("eng", Invalid),
        ("english", Invalid),
        ("en-US", Invalid),
    ],
)
def test_iso_language_code(value, expected):
    context = {}
    if expected is Invalid:
        with pytest.raises(expected):
            validators.iso_language_code(value, context)
    else:
        assert validators.iso_language_code(value, context) == expected


@pytest.mark.parametrize(
    "value,expected",
    [
        (
            [{"name": "Test User", "email": "test@example.com"}, {"name": "Test User 2", "email": "test.user.2@example.com"}],
            [{"name": "Test User", "email": "test@example.com"}, {"name": "Test User 2", "email": "test.user.2@example.com"}],
        ),
        (
            [],
            Invalid,
        ),
        (
            [{"name": "Test User", "email": "not an email address"}, {"name": "Test User 2", "email": "test.user.2@example.com"}],
            Invalid,
        ),
        (
            [{"name": "Test User", "email": "test@example.com", "unsupported_key": "some value"}, {"name": "Test User 2", "email": "test.user.2@example.com"}],
            Invalid,
        ),
        (
            [{"name": "Test User"}, {"name": "Test User 2", "email": "test.user.2@example.com"}],
            Invalid,
        ),
        (
            [{"name": "Test User", "email": "test@example.com"}, {"email": "test.user.2@example.com"}],
            Invalid,
        ),
    ],
)
def test_agents_json_object(value, expected):
    context = {}
    if expected is Invalid:
        with pytest.raises(expected):
            validators.agents_json_object(value, context)
    else:
        assert validators.agents_json_object(value, context) == expected


def test_dataset_title_min():
    context = {}
    data = {"owner_org": "org-id", "title": "A"}
    with pytest.raises(tk.ValidationError):
        validators.dataset_cross_fields(context, data)


def test_dataset_public_requires_technical_notes():
    context = {}
    data = {"owner_org": "org-id", "visibility_type": "public"}
    with pytest.raises(tk.ValidationError):
        validators.dataset_cross_fields(context, data)

def test_dataset_rw_requires_fields():
    context = {}
    data = {"owner_org": "org-id", "rw_dataset": True}
    with pytest.raises(tk.ValidationError):
        validators.dataset_cross_fields(context, data)


def test_dataset_success():
    context = {}
    data = {
        "owner_org": "org-id",
        "title": "Valid title",
        "visibility_type": "private",
        "authors": [{"name": "Author Name", "email": "author@example.com"}],
        "maintainers": [{"name": "Maintainer Name", "email": "maintainer@example.com"}],
        "rw_dataset": False,
    }
    assert validators.dataset_cross_fields(context, data) is True