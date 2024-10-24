from prefect import task, get_run_logger, variables
from prefect.blocks.system import Secret

import csv
import requests
import re
import json
import pycountry
import markdown
import os
from xml.etree import ElementTree as ET

import ckanapi


RW_API = "https://api.resourcewatch.org/v1/dataset"
GFW_API = "https://data-api.globalforestwatch.org"
DEPLOYMENT_ENV = os.environ["FLOW_DEPLOYMENT_ENV"]
CKAN_API_KEY = Secret.load(f"ckan-api-key-{DEPLOYMENT_ENV}").get()
CKAN_URL = variables.get(f"ckan_url_{DEPLOYMENT_ENV}")
FRONTEND_CKAN_URL = variables.get(f"ckan_frontend_url_{DEPLOYMENT_ENV}")


ckan = ckanapi.RemoteCKAN(CKAN_URL, apikey=CKAN_API_KEY)


# pattern from https://html.spec.whatwg.org/#e-mail-state-(type=email)
email_pattern = re.compile(
    # additional pattern to reject malformed dots usage
    r"^(?!\.)(?!.*\.$)(?!.*?\.\.)"
    r"[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9]"
    r"(?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9]"
    r"(?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$"
)


def email_validator(value, agent_type, log, log_name):
    """Validate email input"""

    if value and email_pattern.match(value):
        return True

    log.error(f"{log_name} Invalid {agent_type} email: {value if value else 'None'}")

    return False


def munge_title_to_name(name: str) -> str:
    # Taken from CKAN 2.10 codebase
    """Munge a package title into a package name."""
    name = substitute_ascii_equivalents(name)
    # convert spaces and separators
    name = re.sub("[ .:/]", "-", name)
    # take out not-allowed characters
    name = re.sub("[^a-zA-Z0-9-_]", "", name).lower()
    # remove doubles
    name = re.sub("-+", "-", name)
    # remove leading or trailing hyphens
    name = name.strip("-")
    # if longer than max_length, keep last word if a year
    max_length = 100
    # (make length less than max, in case we need a few for '_' chars
    # to de-clash names.)
    if len(name) > max_length:
        year_match = re.match(r".*?[_-]((?:\d{2,4}[-/])?\d{2,4})$", name)
        if year_match:
            year = year_match.groups()[0]
            name = "%s-%s" % (name[: (max_length - len(year) - 1)], year)
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
        0xC0: "A",
        0xC1: "A",
        0xC2: "A",
        0xC3: "A",
        0xC4: "A",
        0xC5: "A",
        0xC6: "Ae",
        0xC7: "C",
        0xC8: "E",
        0xC9: "E",
        0xCA: "E",
        0xCB: "E",
        0xCC: "I",
        0xCD: "I",
        0xCE: "I",
        0xCF: "I",
        0xD0: "Th",
        0xD1: "N",
        0xD2: "O",
        0xD3: "O",
        0xD4: "O",
        0xD5: "O",
        0xD6: "O",
        0xD8: "O",
        0xD9: "U",
        0xDA: "U",
        0xDB: "U",
        0xDC: "U",
        0xDD: "Y",
        0xDE: "th",
        0xDF: "ss",
        0xE0: "a",
        0xE1: "a",
        0xE2: "a",
        0xE3: "a",
        0xE4: "a",
        0xE5: "a",
        0xE6: "ae",
        0xE7: "c",
        0xE8: "e",
        0xE9: "e",
        0xEA: "e",
        0xEB: "e",
        0xEC: "i",
        0xED: "i",
        0xEE: "i",
        0xEF: "i",
        0xF0: "th",
        0xF1: "n",
        0xF2: "o",
        0xF3: "o",
        0xF4: "o",
        0xF5: "o",
        0xF6: "o",
        0xF8: "o",
        0xF9: "u",
        0xFA: "u",
        0xFB: "u",
        0xFC: "u",
        0xFD: "y",
        0xFE: "th",
        0xFF: "y",
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

    r = ""
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

    error_message = ""

    if value and isinstance(value, str):
        try:
            is_lang = pycountry.languages.get(alpha_2=value)

            if not is_lang:
                error_message = (
                    f"Value must be a valid ISO 639-1 language code: {value}"
                )

        except Exception as e:
            error_message = f"Error validating language code: {e}"
    else:
        error_message = "Language code is not a string or is empty"

    if error_message:
        log.error(error_message)

        return ""
    else:
        return value


def url_validator(value):
    """
    Check that the value is a valid URL. Must start with "http://" or "https://".
    "ftp://" is not currently supported.

    e.g. "http://example.com"
    """
    log = get_run_logger()

    error_message = ""

    if value in [None, ""]:
        return value

    if isinstance(value, str):
        if not value.startswith("http://") and not value.startswith("https://"):
            error_message = 'Value must start with "http://" or "https://"'
    else:
        error_message = "URL is not a string"

    if error_message:
        log.error(error_message)

        return ""
    else:
        return value


def normalize_value(value):
    """
    Normalize value to string and strip whitespace.
    """
    if value is None:
        return "None"

    if not isinstance(value, str):
        value = str(value)

    if value in ["True", "False"]:
        value = value.lower()

    return value.strip()


def check_dataset_exists(dataset_id, rw_id=None, application=None):
    """
    Check if dataset exists in CKAN.
    """
    log = get_run_logger()
    try:
        dataset = ckan.action.package_show(id=dataset_id)
        return True, dataset
    except ckanapi.errors.NotFound:
        if rw_id and application:
            dataset = ckan.action.package_search(
                fq=f"+rw_id:{rw_id} +application:{application}"
            )

            dataset_count = dataset.get("count")
            dataset_results = dataset.get("results")

            if dataset_count > 1:
                log.warning(f"Multiple datasets found with rw_id: {rw_id}")
                log.warning("Datasets:")

                for result in dataset_results:
                    log.warning(f"  - {result.get('name')}")

                log.warning("Using the first dataset found.")

            return dataset_count > 0, dataset_results[0] if dataset_count > 0 else None

        return False, None


@task(retries=3, retry_delay_seconds=5)
def get_datasets_from_csv(file_name):
    """
    Read datasets from CSV file.
    """
    file_path = f"files/{file_name}"
    with open(file_path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        datasets = []

        for row in reader:
            dataset = {}
            dataset_id = row.get("rw_dataset_id")
            gfw_dataset = row.get("gfw_dataset")
            application = row.get("application")
            gfw_only = row.get("gfw_only") or False

            if not dataset_id:
                if not gfw_dataset:
                    raise ValueError("Either 'rw_dataset_id' or 'gfw_dataset' required")
                else:
                    dataset_id = gfw_dataset
                    gfw_only = True
                    application = "gfw"

            if not application:
                raise ValueError("'application' required")

            team = row.get("team")
            topics = row.get("topics")
            layer_ids = row.get("layer_ids")
            authors = row.get("authors")
            maintainers = row.get("maintainers")
            geographic_coverage = row.get("geographic_coverage")
            layer_names = row.get("layer_names")
            dataset_title = row.get("dataset_title")
            dataset_slug = row.get("dataset_slug")

            if topics:
                topics = topics.split(",")

            if layer_ids:
                layer_ids = layer_ids.split(",")

            dataset = {
                "rw_dataset_id": dataset_id,
                "gfw_dataset": gfw_dataset,
                "gfw_only": gfw_only,
                "application": application,
                "team": team,
                "topics": topics,
                "authors": authors,
                "maintainers": maintainers,
                "layer_ids": layer_ids,
                "layer_names": layer_names,
                "geographic_coverage": geographic_coverage,
                "dataset_title": dataset_title,
                "dataset_slug": dataset_slug,
            }
            datasets.append(dataset)

    return datasets


@task(retries=10, retry_delay_seconds=5)
def send_migration_dataset(data_dict):
    log = get_run_logger()

    dataset_id = data_dict.get("rw_dataset_id")
    gfw_dataset = data_dict.get("gfw_dataset")
    application = data_dict.get("application")
    gfw_only = data_dict.get("gfw_only")
    gfw_version = data_dict.get("gfw_version")
    dataset_slug = data_dict.get("dataset_slug")
    gfw_only = data_dict.get("gfw_only") or False

    if not dataset_id:
        if not gfw_dataset:
            raise ValueError("Either 'rw_dataset_id' or 'gfw_dataset' required")
        else:
            dataset_id = gfw_dataset
            gfw_only = True
            application = "gfw"

    if not application:
        raise ValueError("'application' required")

    dataset = get_dataset_from_api(
        dataset_id, application, gfw_dataset, gfw_only, gfw_version
    )
    external_dataset_slug = (
        dataset.get("dataset", {}).get("slug") if not gfw_only else dataset_id
    )

    dataset_slug = dataset_slug or external_dataset_slug

    rw_dataset_url = None

    if external_dataset_slug:
        rw_dataset_url = (
            f"https://resourcewatch.org/data/explore/{external_dataset_slug}"
        )

    dataset = prepare_dataset(dataset, data_dict, gfw_only)

    dataset_name = dataset.get("name")

    ckan_dataset_url = None

    if dataset_name:
        ckan_dataset_url = f"{FRONTEND_CKAN_URL}/datasets/{dataset_name}"

    return (
        migrate_dataset(dataset),
        rw_dataset_url,
        ckan_dataset_url,
        dataset_id,
        dataset_name,
    )


def update_existing_resources(dataset, existing_resources, new_resources):
    log = get_run_logger()
    updated_resources = []
    existing_by_id = {}
    new_by_id = {}
    updated = False

    for resource in existing_resources:
        rw_id = resource.get("rw_id")
        name = resource.get("name")

        if rw_id:
            existing_by_id[rw_id] = resource
        else:
            existing_by_id[name] = resource

    for resource in new_resources:
        rw_id = resource.get("rw_id")
        name = resource.get("name")

        if rw_id:
            new_by_id[rw_id] = resource
        else:
            new_by_id[name] = resource

    for key, existing_resource in existing_by_id.items():
        if key in new_by_id:
            rw_id = existing_resource.get("rw_id")
            new_resource = new_by_id[key]
            updated_resource = {
                "id": existing_resource.get("id"),
                "package_id": existing_resource.get("package_id"),
                "is_pending": False,
            }
            compare_fields = [
                "rw_id",
                "url",
                "type",
                "url_type",
                "name",
                "format",
                "spatial_geom",
            ]

            for field in compare_fields:
                if new_resource.get(field) != existing_resource.get(field):
                    log.info(
                        f"Resource field changed: {field} - {existing_resource.get(field)} -> {new_resource.get(field)}"
                    )
                    updated = True

            if updated:
                updated_resource = {**updated_resource, **new_resource}
                updated_resources.append(updated_resource)
            else:
                updated_resources.append(existing_resource)

            del new_by_id[key]

    for key, new_resource in new_by_id.items():
        updated = True
        new_resource["package_id"] = dataset.get("id")
        new_resource["is_pending"] = False
        updated_resources.append(new_resource)

    return updated_resources, updated


def migrate_dataset(data_dict):
    log = get_run_logger()

    dataset_name = data_dict.get("name")
    dataset_exists, dataset = check_dataset_exists(
        dataset_name, data_dict.get("rw_id"), data_dict.get("application")
    )

    log_name = f'{dataset_name if dataset_name else "Unknown dataset"} -'

    msg = "Dataset migrated"

    if not dataset_exists:
        try:
            dataset = ckan.action.old_package_create(**data_dict)
            log.info(f"{log_name} Dataset created")
        except ckanapi.errors.ValidationError as e:
            log.error(f"{log_name} Validation error: {e}")
            log.error(f"{log_name} Dataset:", json.dumps(data_dict, indent=2))
            raise e
    else:
        log.info(f"{log_name} Dataset already exists")

        updated_dataset = {}
        dataset_changed = False

        for key, value in data_dict.items():
            dataset_value = dataset.get(key)

            if (
                not all(v in ["", None] for v in [dataset_value, value])
                and dataset_value != value
                and key
                not in [
                    "resources",
                    "extras",
                    "groups",
                    "organization",
                    "owner_org_name",
                    "migration_extras",
                    "tags",
                ]
            ):
                dataset_changed = True
                updated_dataset[key] = value

        if dataset_changed:
            log.info(f"{log_name} Dataset changed...")

            for key, value in updated_dataset.items():
                log.info(f"{log_name} {key} changed: {dataset.get(key)} -> {value}")

        existing_tags = dataset.get("tags", [])
        new_tags = data_dict.get("tags", [])

        if len(existing_tags) != len(new_tags) or any(
            tag.get("name") not in [t.get("name") for t in new_tags]
            for tag in existing_tags
        ):
            log.info(f"{log_name} Tags changed...")
            log.info(f"{log_name} Existing tags: {json.dumps(existing_tags, indent=2)}")
            log.info(f"{log_name} New tags: {json.dumps(new_tags, indent=2)}")
            updated_dataset["tags"] = new_tags

        existing_groups = dataset.get("groups", [])
        new_groups = data_dict.get("groups", [])

        if len(existing_groups) != len(new_groups) or any(
            group.get("name") not in [g.get("name") for g in new_groups]
            for group in existing_groups
        ):
            log.info(f"{log_name} Topics changed...")
            log.info(
                f"{log_name} Existing topics: {json.dumps(existing_groups, indent=2)}"
            )
            log.info(f"{log_name} New topics: {json.dumps(new_groups, indent=2)}")
            updated_dataset["groups"] = new_groups
        else:
            log.info(f"{log_name} No topic changes")

        existing_organization = (
            dataset.get("organization", {}).get("name")
            if isinstance(dataset.get("organization"), dict)
            else None
        )
        new_organization = (
            data_dict.get("organization", {}).get("name")
            if isinstance(data_dict.get("organization"), dict)
            else data_dict.get("owner_org_name")
        )

        if existing_organization != new_organization:
            log.info(f"{log_name} Team changed...")
            log.info(f"{log_name} Existing team: {existing_organization}")
            log.info(f"{log_name} New team: {new_organization}")

            if new_organization:
                try:
                    owner_org = ckan.action.organization_show(id=new_organization)
                    updated_dataset["owner_org"] = owner_org["id"]
                except (ckanapi.errors.NotFound, ckanapi.errors.ValidationError):
                    log.error(f"{log_name} Team not found: {new_organization}")
            else:
                log.info("Team removed")
                updated_dataset["owner_org"] = ""

        existing_extras = dataset.get("extras", [])
        existing_migration_extras = dataset.get("migration_extras", {})
        new_migration_extras = data_dict.get("migration_extras", {})

        normalized_existing_extras = {
            extra.get("key"): normalize_value(extra.get("value"))
            for extra in existing_extras
        }
        normalized_existing_migration_extras = {
            key: normalize_value(value)
            for key, value in existing_migration_extras.items()
        }
        normalized_new_migration_extras = {
            key: value for key, value in new_migration_extras.items()
        }

        old_migration_extras = []
        old_extras = []

        for extra in normalized_existing_extras:
            if not (extra.startswith("dataset.") or extra.startswith("metadata.")):
                old_extras.append(extra)
            else:
                old_migration_extras.append(extra)

        if old_migration_extras:
            log.info(f"{log_name} Found old migration_extras in extras. Removing...")
            log.info(
                f"{log_name} Existing extras: {json.dumps(normalized_existing_extras, indent=2)}"
            )
            log.info(
                f"{log_name} New extras: {json.dumps(normalized_new_migration_extras, indent=2)}"
            )

            updated_dataset["extras"] = old_extras

        if (
            len(normalized_new_migration_extras)
            != len(normalized_existing_migration_extras)
        ) or (
            any(
                normalized_new_migration_extras.get(key)
                != normalized_existing_migration_extras.get(key)
                for key in new_migration_extras
            )
        ):
            log.info(f"{log_name} Migration extras changed...")
            log.info(
                f"{log_name} Existing migration extras: {json.dumps(normalized_existing_migration_extras, indent=2)}"
            )
            log.info(
                f"{log_name} New migration extras: {json.dumps(normalized_new_migration_extras, indent=2)}"
            )
            updated_dataset["migration_extras"] = normalized_new_migration_extras
        else:
            log.info(f"{log_name} No migration extras changes")

        existing_resources = dataset.get("resources", [])
        new_resources = data_dict.get("resources", [])

        updated_resources, resource_changes = update_existing_resources(
            dataset, existing_resources, new_resources
        )

        remove_resources = existing_resources and not new_resources

        if resource_changes:
            log.info(f"{log_name} Resources/layers changed...")
            log.info(
                f"{log_name} Existing resources: {json.dumps(existing_resources, indent=2)}"
            )
            log.info(f"{log_name} New resources: {json.dumps(new_resources, indent=2)}")

            if updated_resources:
                updated_dataset["resources"] = updated_resources
            elif remove_resources:
                updated_dataset["resources"] = []
        else:
            log.info(f"{log_name} No resource/layer changes")

        if updated_dataset:
            updated_dataset["id"] = dataset.get("id")
            log.info(f"{log_name} Updating dataset")

            try:
                ckan.action.old_package_patch(**updated_dataset)
                log.info(f"{log_name} Dataset updated: {dataset_name}")
            except ckanapi.errors.ValidationError as e:
                log.error(f"{log_name} Validation error: {e}")
                log.error(
                    f"{log_name} Dataset: {json.dumps(updated_dataset, indent=2)}"
                )
                raise e
        else:
            log.info(f"{log_name} No changes required for dataset")

    log.info(f"{log_name} FINISHED DATASET MIGRATION")

    return msg


def get_paths(data):
    paths = []

    for key in ["metadata", "dataset"]:
        for inner_key, inner_value in data[key].items():
            full_path = f"{key}.{inner_key}"

            if isinstance(inner_value, dict):
                if inner_key not in ["info", "resource"]:
                    continue

                if inner_key == "info":
                    for info_key, info_value in inner_value.items():
                        if info_key == "sources" and isinstance(info_value, list):
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
                if inner_key == "resource":
                    for resource_key, resource_value in inner_value.items():
                        paths.append((f"{full_path}.{resource_key}", resource_value))
                continue

            if isinstance(inner_value, list):
                if inner_key == "application":
                    for index, item in enumerate(inner_value):
                        if not isinstance(item, dict):
                            paths.append((f"{full_path}.{index}", item))
                continue

            paths.append((full_path, inner_value))

    return paths


def get_dataset_from_api(
    dataset_id, application, gfw_dataset=None, gfw_only=False, gfw_version=None
):
    log = get_run_logger()

    gfw_dataset_exists = False
    is_gfw = True if ((application == "gfw" or gfw_only) and gfw_dataset) else False
    url = f"{RW_API}/{dataset_id}/metadata"

    if is_gfw:
        gfw_dataset_url = f"{GFW_API}/dataset/{gfw_dataset}"
        dataset_response = requests.get(gfw_dataset_url)

        if dataset_response.status_code != 200:
            log.error(f"GFW dataset not found: {dataset_id}")
        else:
            gfw_dataset_exists = True
            url = gfw_dataset_url

    response = requests.get(url)
    output_object = {"metadata": {}, "dataset": {}}

    if check_reponse_status(response):
        datasets = response.json()["data"]

        if datasets:
            if is_gfw and gfw_dataset_exists:
                metadata = datasets.get("metadata", {})
                metadata["dataset_id"] = dataset_id
                metadata["gfw_dataset"] = gfw_dataset
                metadata["name"] = dataset_id
                metadata["versions"] = datasets.get("versions", [])
                output_object["metadata"] = metadata
            else:
                metadata = [
                    m
                    for m in datasets
                    if m["attributes"]["application"] == application
                    and m["attributes"]["language"] == "en"
                ]

                if len(metadata) > 0:
                    full_metadata = metadata[0].get("attributes", {})
                    output_metadata = {}

                    for key, value in full_metadata.items():
                        if key in ["resource", "info"] or type(value) != dict:
                            output_metadata[key] = value

                    output_object["metadata"] = output_metadata

                    if output_object["metadata"]:
                        output_object["metadata"]["dataset_id"] = metadata[0]["id"]
                        output_object["metadata"]["dataset_type"] = metadata[0]["type"]

    gfw_config = None
    gfw_asset_id = None
    gfw_dataset_version = gfw_version or "latest"

    if application == "gfw" and gfw_dataset_exists:
        try:
            dataset_url = f"{gfw_dataset_url}/{gfw_dataset_version}/assets"
            dataset_response = requests.get(dataset_url)

            if check_reponse_status(dataset_response):
                gfw_assets = dataset_response.json()["data"]

                if gfw_assets:
                    gfw_asset = gfw_assets[0]
                    gfw_asset_id = gfw_asset.get("asset_id")

            if gfw_asset_id:
                gfw_config_response = requests.get(
                    f"{GFW_API}/asset/{gfw_asset_id}/creation_options"
                )

                if check_reponse_status(gfw_config_response):
                    gfw_config = gfw_config_response.json()["data"]
                    output_object["gfw_config"] = gfw_config

                if gfw_config and gfw_config.get("source_type") == "raster":
                    tiles_info_url = f"{GFW_API}/asset/{gfw_asset_id}/tiles_info"
                    tiles_info_response = requests.get(tiles_info_url)

                    if check_reponse_status(tiles_info_response):
                        tiles_info = tiles_info_response.json()["features"]

                        gfw_tiles = {
                            n["properties"]["name"]
                            .split("/")[-1]
                            .replace(".tif", ""): {
                                "type": n["type"],
                                "geometry": n["geometry"],
                            }
                            for n in tiles_info
                            if n.get("properties", {}).get("name")
                        }
                        output_object["gfw_tiles_info"] = gfw_tiles

            output_object["gfw_version"] = gfw_dataset_version
        except Exception as e:
            log.error(f"Error getting GFW API assets: {e}")

    if not gfw_only:
        resource_url = f"{RW_API}/{dataset_id}?includes=layer,vocabulary"
        resource_response = requests.get(resource_url)

        if check_reponse_status(resource_response):
            resource = resource_response.json()["data"]
            full_resource = resource.get("attributes", {})
            output_resource = {}

            for key, value in full_resource.items():
                if type(value) != dict:
                    output_resource[key] = value

            output_object["dataset"] = output_resource
            output_object["dataset"]["dataset_id"] = resource["id"]
            output_object["dataset"]["dataset_type"] = resource["type"]
            output_object["dataset"]["requested_application"] = application.lower()

    return output_object


def check_reponse_status(response):
    log = get_run_logger()

    if response.status_code != 200:
        log.error(f"Error: {response.status_code} - {response.text}")
        raise Exception(f"Error: {response.status_code} - {response.text}")
    return True


def unstringify_agents(agents, agent_type, log, log_name):
    processed_agents = []
    invalid_format_msg = f"{agent_type.capitalize()} must include both a name and email in the following format: '<AUTHOR_1_NAME>:<AUTHOR_1_EMAIL>;<AUTHOR_2_NAME>:<AUTHOR_2_EMAIL>'"

    if not agents:
        log.error(f"{log_name} Missing {agent_type}s")
        return processed_agents

    if isinstance(agents, str):
        agent_list = agents.split(";")

        log.info(f"{log_name} {agent_type}s list: {agent_list}")

        for agent in agent_list:
            if not agent.strip():
                log.error(
                    f"{log_name} Empty {agent_type} found in {agent_type} list\n{invalid_format_msg}"
                )
                continue

            if ":" in agent:
                if agent.count(":") > 1:
                    log.error(
                        f"{log_name} Multiple colons found in {agent_type}\n{invalid_format_msg}"
                    )
                    continue

                name, email = agent.split(":")
                name = name.strip() if name else None
                email = email.strip() if email and email_validator(email, agent_type, log, log_name) else None

                if not name or not email:
                    log.error(
                        f"{log_name} Missing name or email in {agent_type}\n{invalid_format_msg}"
                    )
                    continue

                processed_agents.append({"name": name, "email": email})
            else:
                log.error(
                    f"{log_name} Unrecognized format for: {agent}\nType: {type(agent)}\n{invalid_format_msg}"
                )
                continue

    elif isinstance(agents, list):
        for agent in agents:
            if isinstance(agent, dict):
                name = agent.get("name")
                email = agent.get("email")
                name = name.strip() if name else None
                email = email.strip() if email and email_validator(email, agent_type, log, log_name) else None

                if not name or not email:
                    log.error(
                        f"{log_name} Missing name or email in {agent_type}\n{invalid_format_msg}"
                    )
                    continue

                processed_agents.append({"name": name, "email": email})
            else:
                log.error(
                    f"{log_name} Unrecognized format for: {agent}\nType: {type(agent)}\n{invalid_format_msg}"
                )
                continue
    else:
        log.error(
            f"{log_name} Unrecognized format for: {agents}\nType: {type(agents)}\n{invalid_format_msg}"
        )

    return processed_agents


def stringify_agents(data_dict):
    authors = data_dict.get("authors")
    maintainers = data_dict.get("maintainers")

    if authors and isinstance(authors, list):
        data_dict["authors"] = json.dumps(authors)

    if maintainers and isinstance(maintainers, list):
        data_dict["maintainers"] = json.dumps(maintainers)

    return data_dict


def prepare_dataset(data_dict, original_data_dict, gfw_only=False):
    log = get_run_logger()

    application = original_data_dict.get("application")
    team = original_data_dict.get("team")
    topics = original_data_dict.get("topics")
    whitelist = original_data_dict.get("whitelist")
    blacklist = original_data_dict.get("blacklist")
    layer_ids = original_data_dict.get("layer_ids")
    layer_names = original_data_dict.get("layer_names")
    geographic_coverage = original_data_dict.get("geographic_coverage")
    dataset_title = original_data_dict.get("dataset_title")
    dataset_slug = original_data_dict.get("dataset_slug")
    rw_id = original_data_dict.get("rw_dataset_id")
    is_private = False
    approval_status = "approved"
    is_approved = True
    is_draft = False
    visibility_type = "public"

    def get_value(key, default="", data_object=None):
        data_objects = [dataset, resource]

        if data_object == "dataset":
            data_objects = data_objects[::-1]

        for data_object in data_objects:
            if (
                data_object
                and key in data_object
                and data_object[key] not in [None, ""]
            ):
                return data_object[key]

        return default

    resource = data_dict.get("dataset", {})
    dataset = data_dict.get("metadata", {})

    if dataset:
        dataset = {**dataset, **dataset.get("info", {})}

    base_name = dataset_slug or f'{get_value("name", data_object="dataset")}'

    dataset_application = get_value("application")
    requested_application = application

    warnings = []

    if not requested_application:
        warnings.append(
            f"Requested application not found, using application: {application}"
        )
        requested_application = dataset_application

    if dataset_application and type(dataset_application) == list:
        application = [a.lower() for a in dataset_application]

        if requested_application not in application:
            warnings.append(
                f"Requested application not found in dataset applications: {application}"
            )
            warnings.append(f"Requested application: {requested_application}")

    application = requested_application
    gfw_title = None

    if gfw_only or application == "gfw":
        application = "gfw"
        gfw_title = get_value("title", data_object="metadata")

        if not gfw_title and layer_names:
            layer_name = re.split(r",(?=\S)", layer_names)

            if len(layer_name) == 1:
                gfw_title = layer_name[0]

    name = munge_title_to_name(f"{base_name} {application}")

    log_name = f'{name if name else "Unknown dataset"} -'

    log.info(f"{log_name} STARTING MIGRATION")
    log.info(f"{log_name} Beginning preparation...")

    authors = unstringify_agents(
        original_data_dict.get("authors"), "author", log, log_name
    )
    maintainers = unstringify_agents(
        original_data_dict.get("maintainers"), "maintainer", log, log_name
    )

    for warning in warnings:
        log.warning(warning)

    layers = resource.get("layer")
    description = get_value("overview") or get_value("description")
    metadata_name = get_value("name")
    title = (
        dataset_title
        or gfw_title
        or (metadata_name if metadata_name != rw_id else base_name)
    )
    vocabularies = get_value("vocabulary") or []

    gfw_tags = [tag for tag in (get_value("tags") or [])]
    gfw_tags = gfw_tags if len(gfw_tags) > 1 and gfw_tags[0] != "" else None
    rw_tags = [
        tag
        for vocabulary in vocabularies
        for tag in vocabulary.get("attributes", {}).get("tags", [])
    ]
    rw_tags = rw_tags if len(rw_tags) > 1 and rw_tags[0] != "" else None
    tag_names = gfw_tags or rw_tags
    tags = []

    if tag_names:
        tag_names_cleaned = [
            re.sub(r"[^a-zA-Z0-9-_\. ]", "", tag)[:100] for tag in tag_names
        ]
        tags = [{"name": tag} for tag in tag_names_cleaned]

    cautions = get_value("cautions")
    language = get_value("data_language") or get_value("language")

    if language:
        language = iso_language_code(language)

    citation = get_value("citation")
    learn_more_link = get_value("learn_more") or get_value("learn_more_link")
    function = get_value("functions")

    if function in [None, ""]:
        function = get_value("function")

    data_download_link = get_value("data_download_original_link")

    if data_download_link in [None, ""]:
        data_download_link = get_value("data_download_link")

    if data_download_link:
        data_download_link = url_validator(data_download_link)

    extras = dataset.get("extras", [])

    migration_extras = {p[0]: normalize_value(p[1]) for p in set(get_paths(data_dict))}
    migration_extras = {
        key: value for key, value in migration_extras.items() if value != "None"
    }

    required_dataset_values = {
        "name": name,
        "private": is_private,
        "approval_status": approval_status,
        "is_approved": is_approved,
        "draft": is_draft,
        "application": application,
        "visibility_type": visibility_type,
    }

    html_notes = markdown.markdown(description) if description else ""

    methodology = None

    if html_notes:
        methodology_pattern = re.compile(
            r"(<h3>Methodology</h3>.*?)(?=<h3>)", re.DOTALL
        )
        methodology_match = methodology_pattern.search(html_notes)
        methodology = methodology_match.group(1) if methodology_match else None
        html_notes = methodology_pattern.sub("", html_notes)

    function_text = markdown.markdown(function) if function else ""
    short_description = ""

    if function_text:
        tree = ET.fromstring(f"<root>{function_text}</root>")
        short_description = "".join(tree.itertext())

    dataset_values = {
        "title": title,
        "notes": html_notes,
        "short_description": short_description,
        "migration_extras": migration_extras,
        "extras": extras,
        "cautions": markdown.markdown(cautions) if cautions else "",
        "language": language,
        "citation": citation,
        "function": function_text,
        "url": data_download_link,
        "learn_more": learn_more_link,
        "update_frequency": "",
        "spatial_address": geographic_coverage,
        "authors": authors,
        "maintainers": maintainers,
        "tags": tags,
        "methodology": methodology,
    }

    dataset_dict = {key: value for key, value in dataset_values.items()}

    if team:
        try:
            owner_org = ckan.action.organization_show(id=team)
            required_dataset_values["owner_org"] = owner_org["id"]
            required_dataset_values["owner_org_name"] = owner_org["name"]
        except ckanapi.errors.NotFound:
            log.error(f"{log_name} Team not found: {team}")

    if topics:
        valid_topics = []

        for topic in topics:
            try:
                group = ckan.action.group_show(id=topic)
                valid_topics.append({"name": group["name"]})
            except ckanapi.errors.NotFound:
                log.error(f"{log_name} Topic not found: {topic}")

        if valid_topics:
            required_dataset_values["groups"] = valid_topics

    resources = []

    if application not in ["aqueduct", "aqueduct-water-risk"] and not gfw_only:
        required_dataset_values["rw_id"] = resource["dataset_id"]

        for layer in layers:
            if layer_ids and layer["id"] not in layer_ids:
                continue

            resource_dict = {}
            layer_dict = layer.get("attributes", {})
            layer_id = layer.get("id")
            resource_dict["rw_id"] = layer_id
            resource_dict["url"] = f"{RW_API}/{resource['dataset_id']}/layer/{layer_id}"
            resource_dict["type"] = "layer-raw"
            resource_dict["url_type"] = "layer-raw"
            resource_dict["name"] = layer_dict.get("name", "")
            resource_dict["format"] = "Layer"
            resource_dict["is_pending"] = False
            resource_dict["title"] = layer_dict.get("name", "")

            resources.append(resource_dict)

    gfw_tiles = data_dict.get("gfw_tiles_info", [])
    gfw_config = data_dict.get("gfw_config", {})
    gfw_version = data_dict.get("gfw_version")
    gfw_dataset = original_data_dict.get("gfw_dataset")

    if gfw_tiles and gfw_dataset:
        if gfw_tiles and gfw_config:
            for tile_id, spatial_geom in gfw_tiles.items():

                resource_dict = {
                    "url": f"{GFW_API}/dataset/{gfw_dataset}/{gfw_version}/download/geotiff?grid={gfw_config.get('grid')}&tile_id={tile_id}&pixel_meaning={gfw_config.get('pixel_meaning')}",
                    "type": "link",
                    "url_type": "link",
                    "name": tile_id,
                    "format": "TIF",
                    "is_pending": False,
                    "spatial_geom": spatial_geom,
                    "title": tile_id,
                }

                resources.append(resource_dict)

    if resources:
        dataset_dict["resources"] = resources

    if whitelist:
        dataset_dict = {
            key: value for key, value in dataset_dict.items() if key in whitelist
        }

    if blacklist:
        dataset_dict = {
            key: value for key, value in dataset_dict.items() if key not in blacklist
        }

    dataset_dict = {**required_dataset_values, **dataset_dict}

    dataset_dict = stringify_agents(dataset_dict)

    log.info(
        f"{log_name} Finished preparing dataset: \n{json.dumps(dataset_dict, indent=2)}"
    )

    return dataset_dict
