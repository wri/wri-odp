import pytest

from ckan.logic import NotFound, get_action, ValidationError
from ckan import model
import ckan.tests.factories as factories
from ckan.logic import get_action

import json


@pytest.mark.usefixtures(u'with_plugins', u'test_request_context')
def test_location_search():
    userobj = factories.Sysadmin()
    session = model.Session
    context = {
        'model': model, 'session': session,
        'user': userobj['name'], 'ignore_auth': True,
        'user_obj': userobj
    }

    organization_dict = factories.Organization()
    group_dict = factories.Group()

    dataset_1 = {
        'type': 'dataset',
        'title': 'Test Dataset Schema',
        'name': 'test-dataset-schema',
        'url': 'http://example.com/dataset.json',
        'language': 'en',
        'owner_org': organization_dict['id'],
        'project': 'American Cities Climate Challenge: Renewables Accelerator (U.S. Energy)',
        'application': 'rw app',
        'groups': [{'id': group_dict['id']}],
        'technical_notes': 'http://example.com/technical_notes.pdf',
        'tag_string': 'economy,mental health,government',
        # 'temporal_coverage_start': '2007',
        # 'temporal_coverage_end': '2011',
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
        'methodology': 'A short methodology of the dataset'
    }

    dataset_2 = dict(dataset_1)
    dataset_2["name"] = "dataset-w-polygon"
    dataset_2["spatial"] = json.dumps({"type":"Polygon","coordinates":[[[47.78942,8.003],[44.9636,5.00162],[43.66087,4.95755],[42.76967,4.25259],[42.12861,4.23413],[41.85508309264397,3.918911920483727],[41.1718,3.91909],[40.76848,4.25702],[39.85494,3.83879],[39.55938425876585,3.42206],[38.89251,3.50074],[38.67114,3.61607],[38.43697,3.58851],[38.120915,3.598605],[36.85509323800812,4.447864127672769],[36.159078632855646,4.447864127672769],[35.817447662353516,4.77696566346189],[35.817447662353516,5.338232082790797],[35.29800711823298,5.506],[34.70702,6.594220000000121],[34.25032,6.82607],[34.0751,7.22595],[33.568290000000104,7.71334],[32.95418,7.784970000000101],[33.29480000000012,8.35458],[33.82550000000015,8.37916],[33.97498,8.68456],[33.96162,9.58358],[34.25745,10.63009],[34.73115000000013,10.910170000000107],[34.83163000000013,11.318960000000118],[35.26049,12.08286],[35.86363,12.57828],[36.27022,13.563330000000121],[36.42951,14.42211],[37.59377,14.2131],[37.90607000000011,14.959430000000168],[38.51295,14.50547],[39.0994,14.74064],[39.34061,14.53155],[40.02625000000012,14.51959],[40.8966,14.118640000000141],[41.1552,13.77333],[41.59856,13.452090000000112],[42.00975,12.86582],[42.35156000000012,12.542230000000131],[42.000000000000114,12.100000000000136],[41.66176000000013,11.6312],[41.73959000000019,11.355110000000138],[41.755570000000205,11.050910000000101],[42.31414000000012,11.0342],[42.55493000000013,11.105110000000195],[42.77685184100096,10.92687856693442],[42.55876,10.57258000000013],[42.92812,10.021940000000143],[43.29699000000011,9.540480000000173],[43.67875,9.18358000000012],[46.94834,7.99688],[47.78942,8.003]]]})

    dataset_3 = dict(dataset_1)
    dataset_3["name"] = "dataset-w-address"
    dataset_3["spatial_address"] = "Sao Paulo, Sao Paulo, Brazil"

    try:
        get_action('package_delete')(
            context={'ignore_auth': True},
            data_dict={'id': dataset_1['name']}
        )

        get_action('package_delete')(
            context={'ignore_auth': True},
            data_dict={'id': dataset_2['name']}
        )

        get_action('package_delete')(
            context={'ignore_auth': True},
            data_dict={'id': dataset_3['name']}
        )
    except NotFound:
        pass

    result_1 = get_action('package_create')(
        context=context,
        data_dict=dataset_1
    )

    result_2 = get_action('package_create')(
        context=context,
        data_dict=dataset_2
    )

    result_3 = get_action('package_create')(
        context=context,
        data_dict=dataset_3
    )

    search_1 = get_action('package_search')(
        context=context,
        data_dict={'ext_location_q': '10,10', 'ext_address_q': "test"}
    )['results']

    assert len(search_1) == 0

    search_2 = get_action('package_search')(
        context=context,
        data_dict={'ext_location_q': '9,40', 'ext_address_q': ""}
    )['results']

    assert any(result['name'] == dataset_2['name'] for result in search_2)

    search_3 = get_action('package_search')(
        context=context,
        data_dict={'ext_location_q': '0,0', 'ext_address_q': "Brazil"}
    )['results']

    assert any(result['name'] == dataset_3['name'] for result in search_3)

    try:
        get_action('package_delete')(
            context={'ignore_auth': True},
            data_dict={'id': dataset_1['name']}
        )

        get_action('package_delete')(
            context={'ignore_auth': True},
            data_dict={'id': dataset_2['name']}
        )

        get_action('package_delete')(
            context={'ignore_auth': True},
            data_dict={'id': dataset_3['name']}
        )
    except NotFound:
        pass
