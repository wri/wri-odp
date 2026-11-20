import pytest

import ckanext.wri.logic.validators as validators
import ckan.lib.navl.dictization_functions as df

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


@pytest.mark.parametrize(
    "value,expected",
    [
        (None, None),
        ("", ""),
        ("Economy,Health", "Economy,Health"),
        ("economy, health", "economy, health"),
        (["Economy", "Health"], ["Economy", "Health"]),
        ([{"name": "Economy"}, {"name": "Health"}], [{"name": "Economy"}, {"name": "Health"}]),
        ("Economy,Not A Real Keyword", Invalid),
        (["Economy", "Not A Real Keyword"], Invalid),
        ([{"name": "Not A Real Keyword"}], Invalid),
        (123, Invalid),
    ],
)
def test_approved_tags_validator(value, expected):
    context = {}
    if expected is Invalid:
        with pytest.raises(expected):
            validators.approved_tags_validator(value, context)
    else:
        assert validators.approved_tags_validator(value, context) == expected


def test_approved_tags_validator_lists_rejected_keywords():
    with pytest.raises(Invalid) as excinfo:
        validators.approved_tags_validator("Economy,Foo,Bar", {})

    message = str(excinfo.value)
    assert "Foo" in message
    assert "Bar" in message
    assert "Economy" not in message


@pytest.mark.parametrize(
    "value,expected",
    [
        ("", ""),
        ("Economy", "Economy"),
        ("Economy, raster", "Economy"),
        ("raster", ""),
        ([], []),
        (["Economy"], ["Economy"]),
        (["Economy", "raster"], ["Economy"]),
        ([{"name": "Economy"}, {"name": "raster"}], [{"name": "Economy"}]),
    ],
)
def test_filter_approved_tags(value, expected):
    assert validators.filter_approved_tags(value) == expected


def test_filter_approved_tags_keeps_tag_dicts_untouched():
    tag = {"name": "Economy", "display_name": "Economy", "state": "active"}
    assert validators.filter_approved_tags([tag, {"name": "raster"}]) == [tag]


def test_validate_approved_tags_drops_legacy_tags_instead_of_failing():
    # The UI submits the whole dataset dict, which still carries legacy
    # keywords stored before the approved list existed.
    data_dict = {
        "title": "Dataset",
        "tags": [{"name": "Economy"}, {"name": "raster"}],
    }

    assert validators.validate_approved_tags({}, data_dict) is True
    assert data_dict["tags"] == [{"name": "Economy"}]


def test_validate_approved_tags_rejects_unapproved_tag_string():
    data_dict = {"title": "Dataset", "tag_string": "Economy, raster"}

    with pytest.raises(validators.ValidationError) as excinfo:
        validators.validate_approved_tags({}, data_dict)

    assert "raster" in str(excinfo.value)


def test_validate_approved_tags_allows_approved_tag_string():
    data_dict = {"title": "Dataset", "tag_string": "Economy, Air Quality"}

    assert validators.validate_approved_tags({}, data_dict) is True
