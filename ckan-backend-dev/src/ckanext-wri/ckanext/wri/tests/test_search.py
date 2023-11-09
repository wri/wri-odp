import pytest

from ckan.logic import NotFound, get_action, ValidationError
from ckan import model
import ckan.tests.factories as factories
from ckan.logic import get_action


@pytest.mark.usefixtures(u'with_plugins', u'test_request_context')
def test_search_queries():
    userobj = factories.Sysadmin()
    session = model.Session
    context = {
        'model': model, 'session': session,
        'user': userobj['name'], 'ignore_auth': True,
        'user_obj': userobj
    }

    organization_dict = factories.Organization()
    group_dict = factories.Group()

    dataset = {
        'type': 'dataset',
        'title': 'Test Dataset Schema',
        'name': 'test-dataset-schema',
        'url': 'http://example.com/dataset.json',
        'language': 'en',
        'owner_org': organization_dict['id'],
        'projects': ['wri', 'gfw'],
        'application': 'rw app',
        'groups': [{'id': group_dict['id']}],
        'technical_notes': 'http://example.com/technical_notes.pdf',
        'tag_string': 'economy,mental health,government',
        'temporal_coverage': '2007-2021',
        'update_frequency': 'annually',
        'citation': 'Citation information',
        'visibility_type': 'draft',
        'license_id': 'cc-by-4.0',
        'featured_dataset': True,
        'short_description': 'A short description of the dataset',
        'notes': 'Some useful notes about the data',
        'author': 'Joe Bloggs',
        'author_email': 'joe@example.com',
        'maintainer': 'Joe Bloggs',
        'maintainer_email': 'joe@example.com',
        'function': 'This data is used to...',
        'restrictions': 'This data is restricted to...',
        'reason_for_adding': 'This data is being added because...',
        'learn_more': 'https://example.com/learn_more.pdf',
        'cautions': 'This data should be used with caution because...',
        'summary': 'A short summary of the dataset'
    }

    try:
        get_action('package_delete')(
            context={'ignore_auth': True},
            data_dict={'id': dataset['name']}
        )
    except NotFound:
        pass

    result = get_action('package_create')(
        context=context,
        data_dict=dataset
    )

    fields_to_test = [
        'language', 'projects',
        'application', 'technical_notes',
        'temporal_coverage', 'update_frequency',
        'citation', 'visibility_type',
        'featured_dataset', 'short_description',
        'function', 'restrictions',
        'reason_for_adding', 'learn_more',
        'cautions', 'summary'
    ]

    # Test that correct queries return the dataset
    for field in fields_to_test:
        if field == 'projects':
            result = get_action('package_search')(
                context=context,
                data_dict={'q': f'{field}:"{dataset[field][0]}"'}
            )['results']

            assert result[0]['name'] == dataset['name']

            result = get_action('package_search')(
                context=context,
                data_dict={'q': f'{field}:"{dataset[field][1]}"'}
            )['results']

            assert result[0]['name'] == dataset['name']

        elif field == 'featured_dataset' or field == 'wri_data':
            result = get_action('package_search')(
                context=context,
                data_dict={'q': f'{field}:{dataset[field]}'}
            )['results']

            assert result[0]['name'] == dataset['name']

        else:
            result = get_action('package_search')(
                context=context,
                data_dict={'q': f'{field}:"{dataset[field]}"'}
            )['results']

            assert result[0]['name'] == dataset['name']

    # Test that incorrect queries do not return the dataset
    for field in fields_to_test:
        if field == 'projects':
            result = get_action('package_search')(
                context=context,
                data_dict={'q': f'{field}:"not a project"'}
            )['results']

            if len(result) > 0:
                assert result[0]['name'] != dataset['name']

        elif field == 'featured_dataset' or field == 'wri_data':
            result = get_action('package_search')(
                context=context,
                data_dict={'q': f'{field}:false'}
            )['results']

            if len(result) > 0:
                assert result[0]['name'] != dataset['name']

        else:
            result = get_action('package_search')(
                context=context,
                data_dict={'q': f'{field}:"not a value"'}
            )['results']

            if len(result) > 0:
                assert result[0]['name'] != dataset['name']

    try:
        get_action('package_delete')(
            context={'ignore_auth': True},
            data_dict={'id': dataset['name']}
        )
    except NotFound:
        pass
