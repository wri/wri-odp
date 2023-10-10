import pytest
import ckanext.wri.logic.validators as validators
from ckan.plugins.toolkit import ValidationError


@pytest.mark.parametrize(
    "value,expected",
    [
        (
            "2019-01-01T00:00:00Z/2019-01-01T00:00:00Z",
            "2019-01-01T00:00:00Z/2019-01-01T00:00:00Z"
        ),
        ("2019-01-01T00:00:00Z/2019-01-01T00:00:00", ValidationError),
        ("2019-01-01/2019-01-01", "2019-01-01T00:00:00Z/2019-01-01T23:59:59Z"),
        ("2019-01-01/2019-01-01T00:00:00Z", ValidationError)
    ]
)
def test_iso_datetime_range(value, expected):
    context = {}
    if expected is ValidationError:
        with pytest.raises(expected):
            validators.iso_datetime_range(value, context)
    else:
        assert validators.iso_datetime_range(value, context) == expected


@pytest.mark.parametrize(
    "value,expected",
    [
        ("en", "en"),
        ("EN", "EN"),
        ("eng", ValidationError),
        ("english", ValidationError),
        ("en-US", ValidationError)
    ]
)
def test_iso_language_code(value, expected):
    context = {}
    if expected is ValidationError:
        with pytest.raises(expected):
            validators.iso_language_code(value, context)
    else:
        assert validators.iso_language_code(value, context) == expected
