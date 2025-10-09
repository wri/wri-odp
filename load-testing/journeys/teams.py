import logging
import random
import requests

from locust import TaskSet, task, between, events

import journeys.helpers as helpers


log = logging.getLogger(__name__)


TEAMS = []


# Loads the list of teams from the CKAN API at the start of the test run.
# This guarantees that we're using a team that actually exists.
@events.test_start.add_listener
def _(environment, **kwargs):
    global TEAMS

    base_url = environment.host

    try:
        org_url = f"{base_url}/api/3/action/organization_list"
        org_resp = requests.get(org_url)

        if org_resp.status_code == 200 and org_resp.json().get("success"):
            TEAMS = org_resp.json()["result"]

    except Exception as e:
        log.error(f"Failed to load teams: {e}")


class TeamsSearchTasks(TaskSet):
    wait_time = between(5, 10)

    # Simulates a user visiting the /teams search page and loading its associated data.
    # Includes both HTML and tRPC requests.
    @task
    def load_teams_search_page(self):
        with self.client.get("/teams", name="/teams", catch_response=True) as r:
            helpers.validate_response(r, "teams_search_page", "html")

        payload = {
            "0": {"json": None, "meta": {"values": ["undefined"]}},
            "1": {
                "json": {
                    "search": "",
                    "page": {"start": 0, "rows": 10000},
                    "allTree": True,
                }
            },
        }

        url = helpers.build_trpc_call(
            "teams.getNumberOfSubTeams,teams.getGeneralTeam", payload
        )

        with self.client.get(url, name="teams_search_trpc", catch_response=True) as r2:
            helpers.validate_response(r2, "teams_search_trpc", "trpc")

        self.user.check_session_end()


class TeamsPageTasks(TaskSet):
    wait_time = between(10, 25)

    # Simulates a user visiting a team page and loading its associated data.
    # Includes both HTML and tRPC requests.
    @task
    def visit_team_page(self):
        if not TEAMS:
            log.error("No topics available to visit.")
            return

        team_id = random.choice(TEAMS)
        page_url = f"/teams/{team_id}"

        with self.client.get(page_url, name="team_page", catch_response=True) as r:
            helpers.validate_response(r, "team_page", "html")

        payload = {
            "0": {
                "json": {
                    "search": "",
                    "fq": {"organization": team_id},
                    "page": {"start": 0, "rows": 100},
                }
            }
        }
        url = helpers.build_trpc_call("dataset.getAllDataset", payload)

        with self.client.get(url, name="team_datasets_trpc", catch_response=True) as r2:
            helpers.validate_response(r2, "team_datasets_trpc", "trpc")

        self.user.check_session_end()
