from prefect import task, get_run_logger, variables
from prefect.blocks.system import Secret

import csv
import requests
import re
import json
import pycountry

import ckanapi


DATASETS_FILE = 'files/datasets.csv'
RW_API = 'https://api.resourcewatch.org/v1/dataset'
CKAN_API_KEY = Secret.load("ckan-api-key").get()
CKAN_URL = variables.get("ckan_url")
FRONTEND_CKAN_URL = variables.get("ckan_frontend_url")


ckan = ckanapi.RemoteCKAN(CKAN_URL, apikey=CKAN_API_KEY)


def munge_title_to_name(name: str) -> str:
    # Taken from CKAN 2.10 codebase
    '''Munge a package title into a package name.'''
    name = substitute_ascii_equivalents(name)
    # convert spaces and separators
    name = re.sub('[ .:/]', '-', name)
    # take out not-allowed characters
    name = re.sub('[^a-zA-Z0-9-_]', '', name).lower()
    # remove doubles
    name = re.sub('-+', '-', name)
    # remove leading or trailing hyphens
    name = name.strip('-')
    # if longer than max_length, keep last word if a year
    max_length = 100
    # (make length less than max, in case we need a few for '_' chars
    # to de-clash names.)
    if len(name) > max_length:
        year_match = re.match(r'.*?[_-]((?:\d{2,4}[-/])?\d{2,4})$', name)
        if year_match:
            year = year_match.groups()[0]
            name = '%s-%s' % (name[: (max_length - len(year) - 1)], year)
        else:
            name = name[:max_length]

    return name


def substitute_ascii_equivalents(text_unicode: str) -> str:
    # Taken from CKAN 2.10 codebase
    # Method taken from: http://code.activestate.com/recipes/251871/
    """
    This takes a UNICODE string and replaces Latin-1 characters with something
    equivalent in 7-bit ASCII. It returns a plain ASCII string. This function
    makes a best effort to convert Latin-1 characters into ASCII equivalents.
    It does not just strip out the Latin-1 characters. All characters in the
    standard 7-bit ASCII range are preserved. In the 8th bit range all the
    Latin-1 accented letters are converted to unaccented equivalents. Most
    symbol characters are converted to something meaningful. Anything not
    converted is deleted.
    """
    char_mapping = {
        0xC0: 'A',
        0xC1: 'A',
        0xC2: 'A',
        0xC3: 'A',
        0xC4: 'A',
        0xC5: 'A',
        0xC6: 'Ae',
        0xC7: 'C',
        0xC8: 'E',
        0xC9: 'E',
        0xCA: 'E',
        0xCB: 'E',
        0xCC: 'I',
        0xCD: 'I',
        0xCE: 'I',
        0xCF: 'I',
        0xD0: 'Th',
        0xD1: 'N',
        0xD2: 'O',
        0xD3: 'O',
        0xD4: 'O',
        0xD5: 'O',
        0xD6: 'O',
        0xD8: 'O',
        0xD9: 'U',
        0xDA: 'U',
        0xDB: 'U',
        0xDC: 'U',
        0xDD: 'Y',
        0xDE: 'th',
        0xDF: 'ss',
        0xE0: 'a',
        0xE1: 'a',
        0xE2: 'a',
        0xE3: 'a',
        0xE4: 'a',
        0xE5: 'a',
        0xE6: 'ae',
        0xE7: 'c',
        0xE8: 'e',
        0xE9: 'e',
        0xEA: 'e',
        0xEB: 'e',
        0xEC: 'i',
        0xED: 'i',
        0xEE: 'i',
        0xEF: 'i',
        0xF0: 'th',
        0xF1: 'n',
        0xF2: 'o',
        0xF3: 'o',
        0xF4: 'o',
        0xF5: 'o',
        0xF6: 'o',
        0xF8: 'o',
        0xF9: 'u',
        0xFA: 'u',
        0xFB: 'u',
        0xFC: 'u',
        0xFD: 'y',
        0xFE: 'th',
        0xFF: 'y',
        # 0xa1: '!', 0xa2: '{cent}', 0xa3: '{pound}', 0xa4: '{currency}',
        # 0xa5: '{yen}', 0xa6: '|', 0xa7: '{section}', 0xa8: '{umlaut}',
        # 0xa9: '{C}', 0xaa: '{^a}', 0xab: '<<', 0xac: '{not}',
        # 0xad: '-', 0xae: '{R}', 0xaf: '_', 0xb0: '{degrees}',
        # 0xb1: '{+/-}', 0xb2: '{^2}', 0xb3: '{^3}', 0xb4:"'",
        # 0xb5: '{micro}', 0xb6: '{paragraph}', 0xb7: '*', 0xb8: '{cedilla}',
        # 0xb9: '{^1}', 0xba: '{^o}', 0xbb: '>>',
        # 0xbc: '{1/4}', 0xbd: '{1/2}', 0xbe: '{3/4}', 0xbf: '?',
        # 0xd7: '*', 0xf7: '/'
    }

    r = ''
    for char in text_unicode:
        if ord(char) in char_mapping:
            r += char_mapping[ord(char)]
        elif ord(char) >= 0x80:
            pass
        else:
            r += str(char)
    return r


def iso_language_code(value):
    """
    Check that the value is a valid ISO 639-1 language code.

    e.g. "en"
    """
    log = get_run_logger()

    error_message = ''

    if value and isinstance(value, str):
        try:
            is_lang = pycountry.languages.get(alpha_2=value)

            if not is_lang:
                error_message = (
                    f'Value must be a valid ISO 639-1 language code: {value}'
                )

        except Exception as e:
            error_message = f'Error validating language code: {e}'
    else:
        error_message = 'Language code is not a string or is empty'

    if error_message:
        log.error(error_message)

        return ''
    else:
        return value


def url_validator(value):
    """
    Check that the value is a valid URL. Must start with "http://" or "https://".
    "ftp://" is not currently supported.

    e.g. "http://example.com"
    """
    log = get_run_logger()

    error_message = ''

    if value in [None, '']:
        return value

    if isinstance(value, str):
        if not value.startswith('http://') and not value.startswith('https://'):
            error_message = 'Value must start with "http://" or "https://"'
    else:
        error_message = 'URL is not a string'

    if error_message:
        log.error(error_message)

        return ''
    else:
        return value


def normalize_value(value):
    """
    Normalize value to string and strip whitespace.
    """
    if value is None:
        return 'None'

    if not isinstance(value, str):
        value = str(value)

    if value in ['True', 'False']:
        value = value.lower()

    return value.strip()


def check_dataset_exists(dataset_id):
    """
    Check if dataset exists in CKAN.
    """
    try:
        dataset = ckan.action.package_show(id=dataset_id)
        return True, dataset
    except ckanapi.errors.NotFound:
        return False, None


@task(retries=3, retry_delay_seconds=5)
def get_datasets_from_csv():
    """
    Read datasets from CSV file.
    """
    with open(DATASETS_FILE, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        datasets = []

        for row in reader:
            dataset = {}
            dataset_id = row['datasetId']
            application = row['application']
            team = row.get('team')
            topics = row.get('topics')

            if topics:
                topics = topics.split(',')

            dataset = {
                'id': dataset_id,
                'application': application,
                'team': team,
                'topics': topics,
            }
            datasets.append(dataset)

    return datasets


@task(retries=10, retry_delay_seconds=5)
def send_migration_dataset(data_dict):
    dataset_id = data_dict.get('id')
    application = data_dict.get('application')
    team = data_dict.get('team')
    topics = data_dict.get('topics')
    dataset = get_dataset_from_api(dataset_id, application)
    whitelist = data_dict.get('whitelist')
    blacklist = data_dict.get('blacklist')

    dataset_slug = dataset.get('dataset', {}).get('slug')

    rw_dataset_url = None

    if dataset_slug:
        rw_dataset_url = f'https://resourcewatch.org/data/explore/{dataset_slug}'

    dataset = prepare_dataset(dataset, application, team, topics, whitelist, blacklist)

    dataset_name = dataset.get('name')

    ckan_dataset_url = None

    if dataset_name:
        ckan_dataset_url = f'{FRONTEND_CKAN_URL}/datasets/{dataset_name}'

    return migrate_dataset(dataset), rw_dataset_url, ckan_dataset_url, dataset_id


def migrate_dataset(data_dict):
    log = get_run_logger()

    dataset_exists, dataset = check_dataset_exists(data_dict.get('name'))
    dataset_name = data_dict.get('name')
    log_name = f'{dataset_name if dataset_name else "Unknown dataset"} -'

    msg = 'Dataset migrated'

    if not dataset_exists:
        try:
            ckan.action.package_create(**data_dict)
            log.info(f'{log_name} Dataset created')
        except ckanapi.errors.ValidationError as e:
            log.error(f'{log_name} Validation error: {e}')
            log.error(f'{log_name} Dataset:', json.dumps(data_dict, indent=2))
            raise e
    else:
        log.info(f'{log_name} Dataset already exists')

        updated_dataset = {}
        dataset_changed = False

        for key, value in data_dict.items():
            if dataset.get(key) != value and key not in [
                'resources',
                'extras',
                'groups',
                'organization',
                'owner_org_name',
            ]:
                dataset_changed = True
                updated_dataset[key] = value

        if dataset_changed:
            log.info(f'{log_name} Dataset changed...')

        existing_groups = dataset.get('groups', [])
        new_groups = data_dict.get('groups', [])

        if len(existing_groups) != len(new_groups) or any(
            group.get('name') not in [g.get('name') for g in new_groups]
            for group in existing_groups
        ):
            log.info(f'{log_name} Topics changed...')
            updated_dataset['groups'] = new_groups
        else:
            log.info(f'{log_name} No topic changes')

        existing_organization = (
            dataset.get('organization', {}).get('name')
            if isinstance(dataset.get('organization'), dict)
            else None
        )
        new_organization = (
            data_dict.get('organization', {}).get('name')
            if isinstance(data_dict.get('organization'), dict)
            else data_dict.get('owner_org_name')
        )

        if existing_organization != new_organization:
            log.info(f'{log_name} Team changed...')

            try:
                owner_org = ckan.action.organization_show(id=new_organization)
                updated_dataset['owner_org'] = owner_org['id']
            except (ckanapi.errors.NotFound, ckanapi.errors.ValidationError):
                log.error(f'{log_name} Team not found: {new_organization}')

        existing_extras = dataset.get('extras', [])
        new_extras = data_dict.get('extras', [])
        normalized_existing_extras_by_key = {
            extra.get('key'): normalize_value(extra.get('value'))
            for extra in existing_extras
        }
        normalized_new_extras_by_key = {
            extra.get('key'): normalize_value(extra.get('value'))
            for extra in new_extras
        }

        if (len(existing_extras) != len(new_extras)) or (
            any(
                normalized_new_extras_by_key.get(extra.get('key'))
                != normalized_existing_extras_by_key.get(extra.get('key'))
                for extra in new_extras
            )
        ):
            log.info(f'{log_name} Extras changed...')
            updated_dataset['extras'] = [
                {'key': key, 'value': value}
                for key, value in normalized_new_extras_by_key.items()
            ]
        else:
            log.info(f'{log_name} No extras changes')

        existing_resources = dataset.get('resources', [])
        new_resources = data_dict.get('resources', [])
        new_layers_by_id = {r.get('rw_id'): r for r in new_resources if r.get('rw_id')}
        existing_layers_by_id = {
            r.get('rw_id'): r for r in existing_resources if r.get('rw_id')
        }

        updated_resources = []

        for rw_id, existing_resource in existing_layers_by_id.items():
            if rw_id in new_layers_by_id:
                new_resource = new_layers_by_id[rw_id]
                rw_fields = ['rw_id', 'url', 'type', 'url_type', 'name']
                updated_resource = {
                    'id': existing_resource.get('id'),
                    'package_id': existing_resource.get('package_id'),
                }

                for field in rw_fields:
                    if new_resource.get(field) != existing_resource.get(field):
                        updated_resource[field] = new_resource.get(field)

                updated_resources.append(updated_resource)

                del new_layers_by_id[rw_id]

        for rw_id, new_resource in new_layers_by_id.items():
            new_resource['package_id'] = dataset.get('id')
            updated_resources.append(new_resource)

        resource_changes = True

        if all(
            len(updated_resource) == 2
            and all(k in updated_resource for k in ['id', 'package_id'])
            for updated_resource in updated_resources
        ):
            resource_changes = False

        if resource_changes:
            log.info(f'{log_name} Resources/layers changed...')

            if updated_resources:
                updated_dataset['resources'] = updated_resources
            elif existing_resources and not new_resources:
                updated_dataset['resources'] = []
        else:
            log.info(f'{log_name} No resource/layer changes')

        if updated_dataset:
            updated_dataset['id'] = dataset.get('id')
            log.info(f'{log_name} Updating dataset')

            try:
                ckan.action.package_patch(**updated_dataset)
                log.info(f'{log_name} Dataset updated: {dataset_name}')
            except ckanapi.errors.ValidationError as e:
                log.error(f'{log_name} Validation error: {e}')
                log.error(
                    f'{log_name} Dataset: {json.dumps(updated_dataset, indent=2)}'
                )
                raise e
        else:
            log.info(f'{log_name} No changes required for dataset')

    log.info(f'{log_name} FINISHED DATASET MIGRATION')

    return msg


def get_paths(data):
    paths = []

    for key in ['metadata', 'dataset']:
        for inner_key, inner_value in data[key].items():
            full_path = f'{key}.{inner_key}'

            if isinstance(inner_value, dict):
                if inner_key not in ['info', 'resource']:
                    continue

                if inner_key == 'info':
                    for info_key, info_value in inner_value.items():
                        if info_key == 'sources' and isinstance(info_value, list):
                            for index, source in enumerate(info_value):
                                for source_key, source_value in source.items():
                                    paths.append(
                                        (
                                            f"{full_path}.{info_key}.{index}.{source_key}",
                                            source_value,
                                        )
                                    )

                        if not isinstance(info_value, dict) and not isinstance(
                            info_value, list
                        ):
                            paths.append((f"{full_path}.{info_key}", info_value))
                if inner_key == 'resource':
                    for resource_key, resource_value in inner_value.items():
                        paths.append((f"{full_path}.{resource_key}", resource_value))
                continue

            if isinstance(inner_value, list):
                if inner_key == 'application':
                    for index, item in enumerate(inner_value):
                        if not isinstance(item, dict):
                            paths.append((f"{full_path}.{index}", item))
                continue

            paths.append((full_path, inner_value))

    return paths


def get_dataset_from_api(dataset_id, application):
    log = get_run_logger()

    url = f'{RW_API}/{dataset_id}/metadata'
    response = requests.get(url)
    output_object = {'metadata': {}, 'dataset': {}}

    if response.status_code == 200:
        datasets = response.json()['data']

        if datasets:
            metadata = [
                m
                for m in datasets
                if m['attributes']['application'] == application
                and m['attributes']['language'] == 'en'
            ]

            if len(metadata) > 0:
                full_metadata = metadata[0].get('attributes', {})
                output_metadata = {}

                for key, value in full_metadata.items():
                    if key in ['resource', 'info'] or type(value) != dict:
                        output_metadata[key] = value

                output_object['metadata'] = output_metadata

                if output_object['metadata']:
                    output_object['metadata']['dataset_id'] = metadata[0]['id']
                    output_object['metadata']['dataset_type'] = metadata[0]['type']
    else:
        log.error(f'Error: {response.status_code} - {response.text}')
        raise Exception(f'Error: {response.status_code} - {response.text}')

    resource_url = f'{RW_API}/{dataset_id}?includes=layer'
    resource_response = requests.get(resource_url)

    if resource_response.status_code == 200:
        resource = resource_response.json()['data']
        full_resource = resource.get('attributes', {})
        output_resource = {}

        for key, value in full_resource.items():
            if type(value) != dict:
                output_resource[key] = value

        output_object['dataset'] = output_resource
        output_object['dataset']['dataset_id'] = resource['id']
        output_object['dataset']['dataset_type'] = resource['type']
        output_object['dataset']['requested_application'] = application.lower()
    else:
        log.error(f'Error: {resource_response.status_code} - {resource_response.text}')
        raise Exception(
            f'Error: {resource_response.status_code} - {resource_response.text}'
        )

    return output_object


def prepare_dataset(data_dict, application, team=None, topics=None, whitelist=None, blacklist=None):
    log = get_run_logger()

    def get_value(key, default='', data_object=None):
        data_objects = [dataset, resource]

        if data_object == 'dataset':
            data_objects = data_objects[::-1]

        for data_object in data_objects:
            if (
                data_object
                and key in data_object
                and data_object[key] not in [None, '']
            ):
                return data_object[key]

        return default

    resource = data_dict.get('dataset', {})
    dataset = data_dict.get('metadata', {})

    if dataset:
        dataset = {**dataset, **dataset.get('info', {})}

    base_name = f'{get_value("name", data_object="dataset")}'

    dataset_application = get_value('application')
    requested_application = application

    warnings = []

    if not requested_application:
        warnings.append(
            f'Requested application not found, using application: {application}'
        )
        requested_application = dataset_application

    if dataset_application and type(dataset_application) == list:
        application = [a.lower() for a in dataset_application]

        if requested_application not in application:
            warnings.append(
                f'Requested application not found in dataset applications: {application}'
            )
            warnings.append(f'Requested application: {requested_application}')

    application = requested_application

    name = munge_title_to_name(f'{base_name} {application}')

    log_name = f'{name if name else "Unknown dataset"} -'

    log.info(f'{log_name} STARTING MIGRATION')
    log.info(f'{log_name} Beginning preparation...')

    for warning in warnings:
        log.warning(warning)

    layers = resource.get('layer')
    description = get_value('description')
    title = get_value('name') or base_name
    cautions = get_value('cautions')
    language = get_value('language')

    if language:
        language = iso_language_code(language)

    citation = get_value('citation')
    learn_more_link = get_value('learn_more_link')
    function = (
        get_value('function')
        if get_value('function', False) not in [None, '']
        else get_value('functions')
    )
    data_download_link = url_validator(
        get_value('data_download_original_link')
        if get_value('data_download_original_link', False) not in [None, '']
        else get_value('data_download_link')
    )

    extras = [
        {'key': p[0], 'value': normalize_value(p[1])} for p in set(get_paths(data_dict))
    ]

    required_dataset_values = {
        'name': name,
        'private': False,
        'approval_status': 'approved',
        'is_approved': True,
        'draft': False,
        'private': False,
        'application': application,
        'visibility_type': 'public',
    }

    dataset_values = {
        'title': title,
        'notes': description,
        'extras': extras,
        'cautions': cautions,
        'language': language,
        'citation': citation,
        'function': function,
        'url': data_download_link,
        'learn_more': learn_more_link,
        'update_frequency': '',
    }

    dataset_dict = {key: value for key, value in dataset_values.items() if value}

    if team:
        try:
            owner_org = ckan.action.organization_show(id=team)
            dataset_dict['owner_org'] = owner_org['id']
            dataset_dict['owner_org_name'] = owner_org['name']
        except ckanapi.errors.NotFound:
            log.error(f'{log_name} Team not found: {team}')

    if topics:
        valid_topics = []

        for topic in topics:
            try:
                group = ckan.action.group_show(id=topic)
                valid_topics.append({'name': group['name']})
            except ckanapi.errors.NotFound:
                log.error(f'{log_name} Topic not found: {topic}')

        if valid_topics:
            dataset_dict['groups'] = valid_topics

    resources = []

    dataset_dict['rw_id'] = resource['dataset_id']

    if application not in ['aqueduct', 'aqueduct-water-risk']:
        for layer in layers:
            resource_dict = {}
            layer_dict = layer.get('attributes', {})
            layer_id = layer.get('id')
            resource_dict['rw_id'] = layer_id
            resource_dict['url'] = (
                f'https://api.resourcewatch.org/v1/dataset/{resource["dataset_id"]}/layer/{layer_id}'
            )
            resource_dict['type'] = 'layer-raw'
            resource_dict['url_type'] = 'layer-raw'
            resource_dict['name'] = layer_dict.get('name', '')
            resource_dict['format'] = 'Layer'

            resources.append(resource_dict)

        if resources:
            dataset_dict['resources'] = resources

    if whitelist:
        dataset_dict = {
            key: value
            for key, value in dataset_dict.items()
            if key in whitelist
        }

    if blacklist:
        dataset_dict = {
            key: value
            for key, value in dataset_dict.items()
            if key not in blacklist
        }

    dataset_dict = {**required_dataset_values, **dataset_dict}

    log.info(
        f'{log_name} Finished preparing dataset: \n{json.dumps(dataset_dict, indent=2)}'
    )

    return dataset_dict
