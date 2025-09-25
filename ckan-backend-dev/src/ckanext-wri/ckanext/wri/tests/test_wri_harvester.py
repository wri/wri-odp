from __future__ import absolute_import
import copy

import json

try:
    from unittest.mock import patch, MagicMock, Mock
except ImportError:
    from mock import patch, MagicMock, Mock
import pytest
from requests.exceptions import HTTPError, RequestException

from ckantoolkit.tests.helpers import call_action
from ckantoolkit.tests.factories import Organization, Group

from ckan import model
from ckan.plugins import toolkit
from ckan.common import config as ckan_config

from ckanext.harvest.harvesters.ckanharvester import ContentFetchError
from ckanext.harvest.tests.factories import (
    HarvestSourceObj,
    HarvestJobObj,
    HarvestObjectObj,
)
from ckanext.harvest.tests.lib import run_harvest
import ckanext.harvest.model as harvest_model
from ckanext.wri.harvesters.wri_harvester import WRIHarvesterBase, CKANHarvesterWRI

from ckanext.wri.tests import mock_ckan

# Start CKAN-alike server we can test harvesting against it
mock_ckan.serve()


SOURCE_URL = "http://localhost:8998/files/"
DATASET_FIELDS = [
    "name", "title", "notes", "state", "license_id", "license_title",
    "license_url", "num_resources", "num_tags", "update_frequency",
    "wri_data", "rw_dataset", "short_description", "spatial_address",
    "spatial_type", "visibility_type", "has_chart_views", "isopen",
    "is_approved", "approval_status", "methodology", "cautions",
    "citation", "function", "learn_more", "technical_notes",
    "draft", "featured_dataset", "language", "authors", "maintainers"
]


def extract_field(resources, field):
    return sorted(r.get(field) or "" for r in resources if isinstance(r, dict))


def extract_tag_field(dataset, field):
    return sorted(
        t.get(field) or "" for t in dataset.get("tags", []) if isinstance(t, dict)
    )


def was_last_job_considered_error_free():
    last_job = (
        model.Session.query(harvest_model.HarvestJob)
        .order_by(harvest_model.HarvestJob.created.desc())
        .first()
    )
    job = MagicMock()
    job.source = last_job.source
    job.id = ""
    return bool(WRIHarvesterBase.last_error_free_job(job))


@pytest.mark.usefixtures("with_plugins", "clean_db", "clean_index")
class TestWriCkanHarvester(object):

    #def test_gather_normal(self):
    #    source = HarvestSourceObj(url="http://localhost:%s/" % mock_ckan.PORT)
    #    job = HarvestJobObj(source=source)

    #    harvester = CKANHarvesterWRI()
    #    obj_ids = harvester.gather_stage(job)

    #    assert job.gather_errors == []
    #    assert isinstance(obj_ids, list)
    #    assert len(obj_ids) == len(mock_ckan.DATASETS)

    #    harvest_object = harvest_model.HarvestObject.get(obj_ids[0])

    #    assert harvest_object.guid == mock_ckan.DATASETS[0]["id"]
    #    assert json.loads(harvest_object.content) == mock_ckan.DATASETS[0]

    #def test_fetch_normal(self):
    #    source = HarvestSourceObj(url="http://localhost:%s/" % mock_ckan.PORT)
    #    job = HarvestJobObj(source=source)
    #    harvest_object = HarvestObjectObj(
    #        guid=mock_ckan.DATASETS[0]["id"],
    #        job=job,
    #        content=json.dumps(mock_ckan.DATASETS[0]),
    #    )

    #    harvester = CKANHarvesterWRI()
    #    result = harvester.fetch_stage(harvest_object)

    #    assert harvest_object.errors == []
    #    assert result is True

    #def test_import_normal(self):
    #    org = Organization()
    #    harvest_object = HarvestObjectObj(
    #        guid=mock_ckan.DATASETS[0]["id"],
    #        content=json.dumps(mock_ckan.DATASETS[0]),
    #        job__source__owner_org=org["id"],
    #    )

    #    harvester = CKANHarvesterWRI()
    #    result = harvester.import_stage(harvest_object)

    #    assert harvest_object.errors == []
    #    assert result is True
    #    assert harvest_object.package_id
    #    dataset = model.Package.get(harvest_object.package_id)
    #    assert dataset.name == mock_ckan.DATASETS[0]["name"]

    def test_harvest(self):
        results_by_guid = run_harvest(
            url="http://localhost:%s/" % mock_ckan.PORT, harvester=CKANHarvesterWRI()
        )

        result = results_by_guid[mock_ckan.DATASETS[0]["id"]]

        assert result["state"] == "COMPLETE"
        assert result["report_status"] == "added"
        assert result["dataset"]["name"] == mock_ckan.DATASETS[0]["name"]
        assert result["errors"] == []

        result = results_by_guid[mock_ckan.DATASETS[1]["id"]]

        assert result["state"] == "COMPLETE"
        assert result["report_status"] == "added"
        assert result["dataset"]["name"] == mock_ckan.DATASETS[1]["name"]
        assert result["errors"] == []
        assert was_last_job_considered_error_free()

    def test_harvest_twice(self):
        run_harvest(
            url="http://localhost:%s/" % mock_ckan.PORT, harvester=CKANHarvesterWRI()
        )

        # change the modified date
        datasets = copy.deepcopy(mock_ckan.DATASETS)

        datasets[1]["metadata_modified"] = "2050-05-22T15:55:41.568728"
        datasets[1]["methodology"] = "This is my new methodology"

        with patch("ckanext.wri.tests.mock_ckan.DATASETS", datasets):
            results_by_guid = run_harvest(
                url="http://localhost:%s/" % mock_ckan.PORT,
                harvester=CKANHarvesterWRI(),
            )

        # updated the dataset which has revisions
        result = results_by_guid[mock_ckan.DATASETS[1]["id"]]

        assert result["state"] == "COMPLETE"
        assert result["report_status"] == "updated"
        assert result["dataset"]["name"] == mock_ckan.DATASETS[1]["name"]
        assert result["errors"] == []

        # the other dataset is unchanged and not harvested
        assert (
            mock_ckan.DATASETS[0]["id"] not in results_by_guid
            or "dataset" not in results_by_guid[mock_ckan.DATASETS[0]["id"]]
        )
        assert was_last_job_considered_error_free()

    def test_exclude_organizations(self):
        config = {"organizations_filter_exclude": ["climate-economics-finance"]}
        results_by_guid = run_harvest(
            url="http://localhost:%s" % mock_ckan.PORT,
            harvester=CKANHarvesterWRI(),
            config=json.dumps(config),
        )

        assert "53623dfd-3df6-4f15-a091-67457cdb571f" not in results_by_guid
        assert "85f870b0-29cb-4f92-8f49-1fdcf2156e5b" in results_by_guid

    def test_include_organizations(self):
        config = {"organizations_filter_include": ["electric-school-bus-initiative"]}
        results_by_guid = run_harvest(
            url="http://localhost:%s" % mock_ckan.PORT,
            harvester=CKANHarvesterWRI(),
            config=json.dumps(config),
        )

        assert "82697e64-e223-405f-a1c0-4d882f61384a" in results_by_guid
        assert "53623dfd-3df6-4f15-a091-67457cdb571f" not in results_by_guid

    def test_exclude_groups(self):
        config = {"groups_filter_exclude": ["cities"]}
        results_by_guid = run_harvest(
            url="http://localhost:%s" % mock_ckan.PORT,
            harvester=CKANHarvesterWRI(),
            config=json.dumps(config),
        )

        assert "82697e64-e223-405f-a1c0-4d882f61384a" not in results_by_guid
        assert "5162a96b-80e0-4824-8bff-cac37b27cd5f" in results_by_guid

    def test_include_groups(self):
        config = {"groups_filter_include": ["land"]}
        results_by_guid = run_harvest(
            url="http://localhost:%s" % mock_ckan.PORT,
            harvester=CKANHarvesterWRI(),
            config=json.dumps(config),
        )

        assert "80b8f4f3-cedb-4893-87b8-9e3ec4a40c33" in results_by_guid
        assert "53623dfd-3df6-4f15-a091-67457cdb571f" not in results_by_guid

    def test_remote_groups_create(self):
        config = {"remote_groups": "create"}
        results_by_guid = run_harvest(
            url="http://localhost:%s" % mock_ckan.PORT,
            harvester=CKANHarvesterWRI(),
            config=json.dumps(config),
        )

        assert "5162a96b-80e0-4824-8bff-cac37b27cd5f" in results_by_guid

        # Check that the remote group was created locally
        call_action("group_show", {}, id="forests")

    def test_harvest_info_in_package_show(self):
        results_by_guid = run_harvest(
            url="http://localhost:%s" % mock_ckan.PORT, harvester=CKANHarvesterWRI()
        )
        assert mock_ckan.DATASETS[0]["id"] in results_by_guid

        # Check that the dataset extras has the harvest_object_id, harvest_source_id, and harvest_source_title
        dataset = call_action(
            "package_show", {"for_view": True}, id=mock_ckan.DATASETS[0]["id"]
        )
        extras_dict = dict((e["key"], e["value"]) for e in dataset["extras"])

        assert "harvest_object_id" in extras_dict
        assert "harvest_source_id" in extras_dict
        assert "harvest_source_title" in extras_dict

    def test_remote_groups_only_local(self):
        # Create an existing group
        Group(id="c74fae7a-9b54-4c02-b7b5-e3ca00bff8ef", name="forests")

        config = {"remote_groups": "only_local"}
        results_by_guid = run_harvest(
            url="http://localhost:%s" % mock_ckan.PORT,
            harvester=CKANHarvesterWRI(),
            config=json.dumps(config),
        )
        assert mock_ckan.DATASETS[0]["id"] in results_by_guid

        # Check that the dataset was added to the existing local group
        dataset = call_action("package_show", {}, id=mock_ckan.DATASETS[0]["id"])

        assert dataset["groups"][0]["id"] == mock_ckan.DATASETS[0]["groups"][0]["id"]

        # Check that the other remote group was not created locally
        with pytest.raises(toolkit.ObjectNotFound):
            call_action("group_show", {}, id="remote-group")

    def test_harvest_not_modified(self):
        results_by_guid_first_run = run_harvest(
            url="http://localhost:%s/" % mock_ckan.PORT, harvester=CKANHarvesterWRI()
        )
        print([k for k, v in results_by_guid_first_run.items()])

        results_by_guid = run_harvest(
            url="http://localhost:%s/" % mock_ckan.PORT, harvester=CKANHarvesterWRI()
        )
        print([k for k, v in results_by_guid.items()])

        # The metadata_modified was the same for this dataset so the import
        # would have returned 'unchanged'
        result = results_by_guid[mock_ckan.DATASETS[1]["id"]]

        assert result["state"] == "COMPLETE"
        assert result["report_status"] == "not modified"
        assert "dataset" not in result
        assert result["errors"] == []
        assert was_last_job_considered_error_free()

    def test_harvest_whilst_datasets_added(self):
        results_by_guid = run_harvest(
            url="http://localhost:%s/datasets_added" % mock_ckan.PORT,
            harvester=CKANHarvesterWRI(),
        )

        assert sorted(results_by_guid.keys()) == sorted(
            [d["id"] for d in mock_ckan.DATASETS]
        )

    def test_harvest_site_down(self):
        results_by_guid = run_harvest(
            url="http://localhost:%s/site_down" % mock_ckan.PORT,
            harvester=CKANHarvesterWRI(),
        )

        assert not results_by_guid
        assert not was_last_job_considered_error_free()

    def test_default_tags(self):
        config = {"default_tags": [{"name": "geo"}]}
        results_by_guid = run_harvest(
            url="http://localhost:%s" % mock_ckan.PORT,
            harvester=CKANHarvesterWRI(),
            config=json.dumps(config),
        )
        tags = results_by_guid[mock_ckan.DATASETS[0]["id"]]["dataset"]["tags"]
        tag_names = [tag["name"] for tag in tags]

        assert "geo" in tag_names

    def test_default_tags_invalid(self):
        config = {"default_tags": ["geo"]}  # should be list of dicts

        with pytest.raises(toolkit.ValidationError) as harvest_context:
            run_harvest(
                url="http://localhost:%s" % mock_ckan.PORT,
                harvester=CKANHarvesterWRI(),
                config=json.dumps(config),
            )

        assert "default_tags must be a list of dictionaries" in str(
            harvest_context.value
        )

    def test_default_groups(self):
        Group(name="group1")
        Group(name="group2")
        Group(name="group3")

        config = {"default_groups": ["group2", "group3"], "remote_groups": "only_local"}
        tmp_c = toolkit.c

        try:
            # c.user is used by the validation (annoying),
            # however patch doesn't work because it's a weird
            # StackedObjectProxy, so we swap it manually
            toolkit.c = MagicMock(user="")
            results_by_guid = run_harvest(
                url="http://localhost:%s" % mock_ckan.PORT,
                harvester=CKANHarvesterWRI(),
                config=json.dumps(config),
            )
        finally:
            toolkit.c = tmp_c

        assert results_by_guid[mock_ckan.DATASETS[0]["id"]]["errors"] == []

        groups = results_by_guid[mock_ckan.DATASETS[0]["id"]]["dataset"]["groups"]
        group_names = set(group["name"] for group in groups)

        # group1 comes from the harvested dataset
        # group2 & 3 come from the default_groups
        assert group_names, set(("group1", "group2" == "group3"))

    def test_default_groups_invalid(self):
        Group(name="group2")

        # should be list of strings
        config = {"default_groups": [{"name": "group2"}]}

        with pytest.raises(toolkit.ValidationError) as harvest_context:
            run_harvest(
                url="http://localhost:%s" % mock_ckan.PORT,
                harvester=CKANHarvesterWRI(),
                config=json.dumps(config),
            )

        assert "default_groups must be a list of group names/ids" in str(
            harvest_context.value
        )

    def test_default_extras(self):
        config = {
            "default_extras": {
                "encoding": "utf8",
                "harvest_url": "{harvest_source_url}/dataset/{dataset_id}",
            }
        }
        results_by_guid = run_harvest(
            url="http://localhost:%s" % mock_ckan.PORT,
            harvester=CKANHarvesterWRI(),
            config=json.dumps(config),
        )

        assert results_by_guid[mock_ckan.DATASETS[0]["id"]]["errors"] == []

        extras = results_by_guid[mock_ckan.DATASETS[0]["id"]]["dataset"]["extras"]
        extras_dict = dict((e["key"], e["value"]) for e in extras)

        assert extras_dict["encoding"] == "utf8"
        assert (
            extras_dict["harvest_url"]
            == "http://localhost:8998/dataset/b1d735e9-cbe1-42f7-ad84-1cb1cb6fd327"
        )

    def test_default_extras_invalid(self):
        config = {
            "default_extras": "utf8",  # value should be a dict
        }

        with pytest.raises(toolkit.ValidationError) as harvest_context:
            run_harvest(
                url="http://localhost:%s" % mock_ckan.PORT,
                harvester=CKANHarvesterWRI(),
                config=json.dumps(config),
            )

        assert "default_extras must be a dictionary" in str(harvest_context.value)

    def test_create_resources_flag_false(self):
        config = {"create_resources": False}
        ckan_site_url = ckan_config.get("ckan.site_url", "http://ckan-dev:5000")

        run_harvest(
            url="http://localhost:%s" % mock_ckan.PORT,
            harvester=CKANHarvesterWRI(),
            config=json.dumps(config),
        )
        dataset = call_action(
            "package_show", {"for_view": True}, id=mock_ckan.DATASETS[0]["id"]
        )
        resources = dataset["resources"]

        source_resources = mock_ckan.DATASETS[0]["resources"]
        source_resource_names = [
            r["name"] for r in source_resources if SOURCE_URL in r["url"]
        ]
        source_resource_urls = {
            r["name"]: r["url"] for r in source_resources if SOURCE_URL not in r["url"]
        }

        for r in resources:
            if r["name"] in source_resource_names:
                assert (
                    ckan_site_url not in r["url"]
                ), f"Resource URL should not contain CKAN site URL for {r['name']}"
            if r["name"] in source_resource_urls:
                assert (
                    r["url"] == source_resource_urls[r["name"]]
                ), f"Resource URL mismatch for {r['name']}"

    def test_create_resources_flag_true(self):
        config = {"create_resources": True}
        ckan_site_url = ckan_config.get("ckan.site_url", "http://ckan-dev:5000")

        run_harvest(
            url="http://localhost:%s" % mock_ckan.PORT,
            harvester=CKANHarvesterWRI(),
            config=json.dumps(config),
        )
        dataset = call_action(
            "package_show", {"for_view": True}, id=mock_ckan.DATASETS[0]["id"]
        )
        resources = dataset["resources"]

        source_resources = mock_ckan.DATASETS[0]["resources"]
        source_resource_names = [
            r["name"] for r in source_resources if SOURCE_URL in r["url"]
        ]
        source_resource_urls = {
            r["name"]: r["url"] for r in source_resources if SOURCE_URL not in r["url"]
        }

        for r in resources:
            if r["name"] in source_resource_names:
                assert (
                    ckan_site_url in r["url"]
                ), f"Resource URL should contain CKAN site URL for {r['name']}"
            if r["name"] in source_resource_urls:
                assert (
                    r["url"] == source_resource_urls[r["name"]]
                ), f"Resource URL mismatch for {r['name']}"

    def test_import_metadata(self):
        results_by_guid = run_harvest(
            url="http://localhost:%s" % mock_ckan.PORT,
            harvester=CKANHarvesterWRI(),
        )

        source_datasets_by_id = {
            dataset["id"]: dataset for dataset in mock_ckan.DATASETS
        }

        for dataset_id, _ in results_by_guid.items():
            actual_dataset = toolkit.get_action("package_show")({}, {"id": dataset_id})
            expected_dataset = source_datasets_by_id[dataset_id]
            actual_resources = actual_dataset.get("resources", [])
            expected_resources = expected_dataset.get("resources", [])

            for field in DATASET_FIELDS:
                assert actual_dataset.get(field) == expected_dataset.get(field), f"{field} mismatch in dataset {dataset_id}"

            for field in ["name", "title", "description", "format", "resource_type"]:
                assert extract_field(actual_resources, field) == extract_field(
                    expected_resources, field
                ), f"Resource {field}s mismatch in dataset {dataset_id}"

            actual_resource_url_types_by_name = {
                r.get("name"): (r.get("url_type") or "" if isinstance(r, dict) else "")
                for r in actual_resources
            }
            expected_resource_url_types_by_name = {
                r.get("name"): (r.get("url_type") or "" if isinstance(r, dict) else "")
                for r in expected_resources
            }

            for name, expected_url_type in expected_resource_url_types_by_name.items():
                actual_type = actual_resource_url_types_by_name.get(name, "")

                if expected_url_type == "upload":
                    assert (
                        actual_type == "link"
                    ), f"Resource URL type mismatch for resource '{name}' in dataset {dataset_id}"
                else:
                    assert (
                        actual_type == expected_url_type
                    ), f"Resource URL type mismatch for resource '{name}' in dataset {dataset_id}"

            actual_resource_urls = {
                r.get("name"): {
                    "url_type": r.get("url_type") or "",
                    "url": r.get("url") or ""
                } if isinstance(r, dict) else {"url_type": "", "url": ""}
                for r in actual_resources
            }

            expected_resource_urls = {
                r.get("name"): {
                    "url_type": r.get("url_type") or "",
                    "url": r.get("url") or ""
                } if isinstance(r, dict) else {"url_type": "", "url": ""}
                for r in expected_resources
            }

            for name, expected_url in expected_resource_urls.items():
                actual_url = actual_resource_urls.get(name, {"url_type": "", "url": ""})

                assert (
                    actual_url["url"] == expected_url["url"]
                ), f"Resource URL mismatch for resource '{name}' in dataset {dataset_id}"

                if expected_url["url_type"] == "upload":
                    assert (
                        actual_url["url_type"] == "link"
                    ), f"Resource URL type mismatch for resource '{name}' in dataset {dataset_id}"
                else:
                    assert (
                        actual_url["url_type"] == expected_url["url_type"]
                    ), f"Resource URL type mismatch for resource '{name}' in dataset {dataset_id}"

            for tag_field in ["name", "display_name"]:
                assert extract_tag_field(actual_dataset, tag_field) == extract_tag_field(expected_dataset, tag_field), \
                    f"Tag {tag_field}s mismatch in dataset {dataset_id}"

    def test_import_metadata_create_resources(self):
        config = {"create_resources": True}
        ckan_site_url = ckan_config.get("ckan.site_url", "http://ckan-dev:5000")

        results_by_guid = run_harvest(
            url="http://localhost:%s" % mock_ckan.PORT,
            harvester=CKANHarvesterWRI(),
            config=json.dumps(config),
        )

        source_datasets_by_id = {
            dataset["id"]: dataset for dataset in mock_ckan.DATASETS
        }

        for dataset_id, _ in results_by_guid.items():
            actual_dataset = toolkit.get_action("package_show")({}, {"id": dataset_id})
            expected_dataset = source_datasets_by_id[dataset_id]
            actual_resources = actual_dataset.get("resources", [])
            expected_resources = expected_dataset.get("resources", [])

            for field in DATASET_FIELDS:
                assert actual_dataset.get(field) == expected_dataset.get(
                    field
                ), f"{field} mismatch in dataset {dataset_id}"

            for field in ["name", "title", "description", "format", "resource_type"]:
                assert extract_field(actual_resources, field) == extract_field(
                    expected_resources, field
                ), f"Resource {field}s mismatch in dataset {dataset_id}"

            actual_resource_url_types_by_name = {
                r.get("name"): (r.get("url_type") or "" if isinstance(r, dict) else "")
                for r in actual_resources
            }
            expected_resource_url_types_by_name = {
                r.get("name"): (r.get("url_type") or "" if isinstance(r, dict) else "")
                for r in expected_resources
            }

            for name, expected_url_type in expected_resource_url_types_by_name.items():
                actual_type = actual_resource_url_types_by_name.get(name, "")

                assert (
                    actual_type == expected_url_type
                ), f"Resource URL type mismatch for resource '{name}' in dataset {dataset_id}"

            actual_resource_urls = {
                r.get("name"): (
                    {"url_type": r.get("url_type") or "", "url": r.get("url") or ""}
                    if isinstance(r, dict)
                    else {"url_type": "", "url": ""}
                )
                for r in actual_resources
            }

            expected_resource_urls = {
                r.get("name"): (
                    {"url_type": r.get("url_type") or "", "url": r.get("url") or ""}
                    if isinstance(r, dict)
                    else {"url_type": "", "url": ""}
                )
                for r in expected_resources
            }

            for name, expected_url in expected_resource_urls.items():
                actual_url = actual_resource_urls.get(name, {"url_type": "", "url": ""})

                assert expected_url["url_type"] == actual_url["url_type"], (
                    f"Resource URL type mismatch for resource '{name}' in dataset {dataset_id}"
                )

                if expected_url["url_type"] == "upload":
                    assert (
                        ckan_site_url in actual_url["url"]
                    ), f"Resource URL should contain CKAN site URL for {name} in dataset {dataset_id}"
                else:
                    assert (
                        actual_url["url"] == expected_url["url"]
                    ), f"Resource URL mismatch for resource '{name}' in dataset {dataset_id}"

            for tag_field in ["name", "display_name"]:
                assert extract_tag_field(
                    actual_dataset, tag_field
                ) == extract_tag_field(
                    expected_dataset, tag_field
                ), f"Tag {tag_field}s mismatch in dataset {dataset_id}"
