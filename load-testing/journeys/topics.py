import logging
import random
import requests

from locust import TaskSet, task, between, events

import journeys.helpers as helpers


log = logging.getLogger(__name__)


TOPICS = []


# Loads the list of topics from the CKAN API at the start of the test run.
# This guarantees that we're using a topic that actually exists.
@events.test_start.add_listener
def _(environment, **kwargs):
    global TOPICS

    base_url = environment.host

    try:
        group_url = f"{base_url}/api/3/action/group_list"
        group_resp = requests.get(group_url)

        if group_resp.status_code == 200 and group_resp.json().get("success"):
            TOPICS = group_resp.json()["result"]

    except Exception as e:
        log.error(f"Failed to load topics: {e}")


class TopicsSearchTasks(TaskSet):
    wait_time = between(5, 15)

    # Simulates a user visiting the /topics search page and loading its associated data.
    # Includes both HTML and tRPC requests.
    @task
    def load_topics_search_page(self):
        with self.client.get("/topics", name="/topics", catch_response=True) as r:
            helpers.validate_response(r, "topics_search_page", "html")

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
            "topics.getNumberOfSubtopics,topics.getGeneralTopics", payload
        )

        with self.client.get(url, name="topics_search_trpc", catch_response=True) as r2:
            helpers.validate_response(r2, "topics_search_trpc", "trpc")

        self.user.check_session_end()


class TopicsPageTasks(TaskSet):
    wait_time = between(10, 20)

    # Simulates a user visiting a topic page and loading its associated data.
    # Includes both HTML and tRPC requests.
    @task
    def visit_topic_page(self):
        if not TOPICS:
            log.error("No topics available to visit.")
            return

        topic_id = random.choice(TOPICS)
        page_url = f"/topics/{topic_id}"

        with self.client.get(page_url, name="topic_page", catch_response=True) as r:
            helpers.validate_response(r, "topic_page", "html")

        payload = {
            "0": {
                "json": {
                    "search": "",
                    "fq": {"groups": topic_id},
                    "page": {"start": 0, "rows": 100},
                }
            }
        }
        url = helpers.build_trpc_call("dataset.getAllDataset", payload)

        with self.client.get(url, name="topic_datasets", catch_response=True) as r2:
            helpers.validate_response(r2, "topic_datasets", "trpc")

        self.user.check_session_end()
