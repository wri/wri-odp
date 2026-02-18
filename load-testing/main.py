import logging
import random
import os
from dotenv import load_dotenv

from locust import HttpUser, between
import locust.stats as stats

from journeys.home import HomeTasks
from journeys.search import SearchTasks
from journeys.datasets import DatasetsTasks
from journeys.teams import TeamsSearchTasks, TeamsPageTasks
from journeys.topics import TopicsSearchTasks, TopicsPageTasks
from journeys.apis import ApiAutomationTasks, ApiManualTasks


log = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s,%(msecs)03d] [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)


load_dotenv()


def _env_int(var, default):
    val = os.getenv(var, None)

    try:
        return int(val) if val is not None else default
    except (ValueError, TypeError):
        log.error(f"Invalid value for {var!r}: {val!r} — using default {default}")
        return default


# Overrides the default Locust stats output.
# Displays response times in seconds instead of milliseconds for better readability.
def to_string_seconds(self, current=True):
    if current:
        rps = self.current_rps
        fail_per_sec = self.current_fail_per_sec
    else:
        rps = self.total_rps
        fail_per_sec = self.total_fail_per_sec

    return (
        f"%-{stats.STATS_TYPE_WIDTH}s %-{(stats.STATS_NAME_WIDTH - stats.STATS_TYPE_WIDTH) + 4}s "
        f"%7d %12s |%7.2f %7.2f %7.2f %7.2f| %7.2f %11.2f"
        % (
            (self.method + " " if self.method else ""),
            self.name,
            self.num_requests,
            "%d(%.2f%%)" % (self.num_failures, self.fail_ratio * 100),
            (self.avg_response_time or 0) / 1000,
            (self.min_response_time or 0) / 1000,
            (self.max_response_time or 0) / 1000,
            (self.median_response_time or 0) / 1000,
            rps or 0,
            fail_per_sec or 0,
        )
    )


stats.StatsEntry.to_string = to_string_seconds


class WebsiteUser(HttpUser):
    wait_time = between(45, 75)

    # Defines how many requests each simulated user performs per "session".
    def on_start(self):
        self.requests_left = random.randint(3, 6)

    def check_session_end(self):
        self.requests_left -= 1

        # Resets the session counter once a user completes all their planned requests.
        if self.requests_left <= 0:
            self.requests_left = random.randint(3, 6)

    # Defines the distribution of different user journeys.
    # TODO: Adjust these once we have better real-world data.
    tasks = {
        HomeTasks: _env_int("HOME_TASKS_WEIGHT", 700),                   # ~70%
        DatasetsTasks: _env_int("DATASETS_TASKS_WEIGHT", 210),           # ~21%
        TopicsSearchTasks: _env_int("TOPICS_SEARCH_TASKS_WEIGHT", 120),  # ~12%
        TopicsPageTasks: _env_int("TOPICS_PAGE_TASKS_WEIGHT", 110),      # ~11%
        SearchTasks: _env_int("SEARCH_TASKS_WEIGHT", 20),                # ~2%
        TeamsSearchTasks: _env_int("TEAMS_SEARCH_TASKS_WEIGHT", 10),     # ~1%
        TeamsPageTasks: _env_int("TEAMS_PAGE_TASKS_WEIGHT", 10),         # ~1%
        ApiAutomationTasks: _env_int("API_AUTOMATION_TASKS_WEIGHT", 20), # ~2%
        ApiManualTasks: _env_int("API_MANUAL_TASKS_WEIGHT", 10),         # ~1%
    }

    task_distribution_message = "Running with task distribution weights:\n\n"

    for task_class, weight in tasks.items():
        task_distribution_message += f"{task_class.__name__}: {weight}\n"

    log.info(task_distribution_message)
