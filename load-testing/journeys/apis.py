import random
import logging

from locust import TaskSet, task, between

import journeys.helpers as helpers


log = logging.getLogger(__name__)


DATASETS = [
    "local-government-renewables-action-tracker",
    "towards-a-more-equal-city-water-sanitation",
    "gfw-forest-carbon-net-flux",
]


# Simulates automated API usage, such as scripts or applications making requests to the API.
class ApiAutomationTasks(TaskSet):
    wait_time = between(1, 5)

    @task(5)
    def organization_list(self):
        with self.client.get(
            "/api/3/action/organization_list",
            name="api_organization_list",
            catch_response=True,
        ) as r:
            helpers.validate_response(r, "api_organization_list", "ckan")

    @task(3)
    def package_list(self):
        with self.client.get(
            "/api/3/action/package_list", name="api_package_list", catch_response=True
        ) as r:
            helpers.validate_response(r, "api_package_list", "ckan")

    @task(2)
    def package_show(self):
        dataset_id = random.choice(DATASETS)
        url = f"/api/3/action/package_show?id={dataset_id}"
        with self.client.get(url, name="api_package_show", catch_response=True) as r:
            helpers.validate_response(r, "api_package_show", "ckan")

    @task(1)
    def status_show(self):
        with self.client.get(
            "/api/3/action/status_show", name="api_status_show", catch_response=True
        ) as r:
            helpers.validate_response(r, "api_status_show", "ckan")


# Simulates manual API usage, such as users running API calls in a terminal.
class ApiManualTasks(TaskSet):
    wait_time = between(10, 30)

    @task(4)
    def light_package_search(self):
        url = f"/api/3/action/package_search"
        with self.client.get(
            url, name="api_light_package_search", catch_response=True
        ) as r:
            helpers.validate_response(r, "api_light_package_search", "ckan")

        self.user.check_session_end()

    @task(3)
    def organization_list(self):
        with self.client.get(
            "/api/3/action/organization_list", name="api_org_list", catch_response=True
        ) as r:
            helpers.validate_response(r, "api_organization_list", "ckan")

        self.user.check_session_end()

    @task(2)
    def group_list(self):
        with self.client.get(
            "/api/3/action/group_list", name="api_group_list", catch_response=True
        ) as r:
            helpers.validate_response(r, "api_group_list", "ckan")

        self.user.check_session_end()

    @task(1)
    def heavy_package_search(self):
        url = f"/api/3/action/package_search?rows=1000"
        with self.client.get(
            url, name="api_heavy_package_search", catch_response=True
        ) as r:
            helpers.validate_response(r, "api_heavy_package_search", "ckan")

        self.user.check_session_end()
