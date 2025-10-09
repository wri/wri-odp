import logging
import random

from locust import HttpUser, between
import locust.stats as stats

from journeys.home import HomeTasks
from journeys.search import SearchTasks
from journeys.datasets import DatasetsTasks
from journeys.teams import TeamsSearchTasks, TeamsPageTasks
from journeys.topics import TopicsSearchTasks, TopicsPageTasks
from journeys.apis import ApiAutomationTasks, ApiManualTasks


log = logging.getLogger(__name__)


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
        HomeTasks: 700,          # ~53.8%
        DatasetsTasks: 200,      # ~15.4%
        TopicsSearchTasks: 120,  # ~9.2%
        TopicsPageTasks: 110,    # ~8.5%
        SearchTasks: 40,         # ~3.1%
        TeamsSearchTasks: 30,    # ~2.3%
        TeamsPageTasks: 30,      # ~2.3%
        ApiAutomationTasks: 50,  # ~3.8%
        ApiManualTasks: 20,      # ~1.5%
    }
