# Load Testing with Locust

This directory contains load testing scripts for the application using [Locust](https://locust.io/). The tests simulate user behavior by making HTTP requests to various endpoints, including both HTML pages and tRPC API calls.

## Setup

1. Install `requirements.txt`:

   ```bash
   pip install -r requirements.txt
   ```
2. Make any necessary adjustments to `locust.conf`, such as the number of users and spawn rate. Current values are:

   ```
   locustfile=main.py
   host=https://datasets.wri.org
   users=20
   spawn-rate=3
   run-time=30m
   print-stats=true
   headless=true
   html=results/report.html
   csv=results/run
   csv-full-history=true
   json-file=results/results
   ```
   **Note**: The `users` value can appear lower than expected, but this is because users in Locust do not behave like real users. Users in Locust loop through tasks as fast as possible until the time limit is reached. We have added some more realistic wait times and attempts to handle user sessions better, but it can still easily get out of hand at higher user counts, essentially simulating a DDoS attack rather than a realistic load test. I think that the total requests per second is a better indicator of performance, and with the current configuration, we're already testing well above the expected production load.
3. If you want to make any user task weight adjustments, copy `.env.example` to `.env` (`cp .env.example .env`), and change the weights in `.env`:

   ```
   # Change these to the desired task distribution percentages (should sum to 1000, so 70% = 700, 2% = 20, etc).
   # A total of 1000 appears to work better than a total of 100, even with the same percentages.
   # Some of the lower percentages (like 1%) were not appearing as often as expected when using a total of 100.
   # Possibly due to some sort of rounding or rough weighting done in Locust backend code.
   HOME_TASKS_WEIGHT=700          # 70%
   DATASETS_TASKS_WEIGHT=210      # 21%
   TOPICS_SEARCH_TASKS_WEIGHT=120 # 12%
   TOPICS_PAGE_TASKS_WEIGHT=110   # 11%
   SEARCH_TASKS_WEIGHT=20         # 2%
   TEAMS_SEARCH_TASKS_WEIGHT=10   # 1%
   TEAMS_PAGE_TASKS_WEIGHT=10     # 1%
   API_AUTOMATION_TASKS_WEIGHT=20 # 2%
   API_MANUAL_TASKS_WEIGHT=10     # 1%
   ```
4. Run Locust (since everything is in config files, no command line args are needed):

   ```bash
   locust
   ```
5. View the results live in the log output, and in `/results` after the test run completes.