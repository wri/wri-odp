import json
import random
import logging

from locust import task, between, SequentialTaskSet

import journeys.helpers as helpers


log = logging.getLogger(__name__)


# Loads a local JSON file from the given path.
# Currently, we only have one file: tropical-tree-cover_mapbox_urls.json.
# TODO: Add more datasets and files as needed.
def _load_requests(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        log.error(f"Request file not found: {path}")
        return []


# TODO: Add more datasets to the list as needed.
DATASETS = ["tropical-tree-cover"]


# Builds a tRPC call to fetch resource locations for a given dataset.
# Simulates the request made when visiting a dataset page in the browser.
def _trpc_resource_location(meta):
    return helpers.build_trpc_call(
        "dataset.resourceLocationSearch",
        {
            "0": {
                "json": {
                    "bbox": None,
                    "point": None,
                    "location": "",
                    "package_id": meta["name"],
                    "is_pending": False,
                }
            }
        },
    )


# Builds a tRPC call to fetch the release notes for a given dataset.
# Simulates the request made when visiting a dataset page in the browser.
def _trpc_release_notes(meta):
    return helpers.build_trpc_call(
        "dataset.getDatasetReleaseNotes",
        {"0": {"json": {"id": meta["id"]}}},
    )


class DatasetsTasks(SequentialTaskSet):
    wait_time = between(10, 30)

    # Makes the same call that a browser does to populate dataset page content.
    def _get_dataset_meta(self, dataset_id: str):
        url = f"/api/3/action/package_show?id={dataset_id}"

        with self.client.get(url, name="dataset_package_show", catch_response=True) as r:
            return helpers.validate_response(r, "dataset_package_show", "ckan")

    # Simulates a user visiting a dataset page and loading its associated resources.
    # Includes both HTML and tRPC requests, as well as loading some map tiles.
    @task
    def visit_dataset_page(self):
        dataset_id = random.choice(DATASETS)
        page_url = f"/datasets/{dataset_id}"

        with self.client.get(page_url, name="dataset_page", catch_response=True) as r:
            helpers.validate_response(r, "dataset_page", "html")

        meta = self._get_dataset_meta(dataset_id)

        if not meta:
            return

        trpc_urls = [
            _trpc_resource_location(meta),
            _trpc_release_notes(meta),
        ]

        for url in trpc_urls:
            with self.client.get(url, name="dataset_trpc", catch_response=True) as r:
                helpers.validate_response(r, "dataset_trpc", "trpc")

        num_tiles = random.randint(0, 20)
        dataset_mapbox_requests = _load_requests(f'journeys/request_files/{dataset_id}_mapbox_urls.json')

        for req in random.sample(
            dataset_mapbox_requests, min(num_tiles, len(dataset_mapbox_requests))
        ):
            url = req["url"]

            with self.client.get(url, name="dataset_mapbox_tile", catch_response=True) as r:
                helpers.validate_response(r, "dataset_mapbox_tile", "tile")

        self.user.check_session_end()
