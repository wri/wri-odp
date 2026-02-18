from urllib.parse import quote
import json
import logging

from locust import SequentialTaskSet, task, between

import journeys.helpers as helpers


log = logging.getLogger(__name__)


class HomeTasks(SequentialTaskSet):
    wait_time = between(2, 5)

    # Simulates a user visiting the home page and loading its associated data.
    # Includes both HTML and tRPC requests.
    @task
    def load_homepage(self):
        with self.client.get("/", name="/", catch_response=True) as r:
            helpers.validate_response(r, "home_page", "html")

        payload = {
            "0": {"json": None, "meta": {"values": ["undefined"]}},
            "1": {
                "json": {
                    "search": "",
                    "page": {"rows": 8, "start": 0},
                    "sortBy": "metadata_created desc",
                    "removeUnecessaryDataInResources": True,
                }
            },
            "2": {
                "json": {
                    "search": "",
                    "page": {"rows": 8, "start": 0},
                    "sortBy": "metadata_modified desc",
                    "removeUnecessaryDataInResources": True,
                }
            },
            "3": {"json": {"removeUnecessaryDataInResources": True}},
            "4": {"json": None, "meta": {"values": ["undefined"]}},
        }

        input_str = quote(json.dumps(payload))

        url = (
            f"/api/trpc/topics.getTopicsHomePage,dataset.getAllDataset,"
            f"dataset.getAllDataset,dataset.getFeaturedDatasets,"
            f"applications.getAllApplications?batch=1&input={input_str}"
        )

        with self.client.get(url, name="home_page_trpc", catch_response=True) as r2:
            helpers.validate_response(r2, "home_page_trpc", "trpc")

        self.user.check_session_end()
