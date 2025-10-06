# Load Testing with Locust

This directory contains load testing scripts for the application using [Locust](https://locust.io/). The tests simulate user behavior by making HTTP requests to various endpoints, including both HTML pages and tRPC API calls.

## Setup

1. Install `requirements.txt`:

   ```bash
   pip install -r requirements.txt
   ```
2. Copy `.env.example` to `.env` and set the `MAPBOX_TOKEN` variable:

   ```bash
   cp .env.example .env
   ```
3. Make any necessary adjustments to `locust.conf`, such as the number of users and spawn rate. Current values are:

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
4. Run Locust (since everything is in config files, no command line args are needed):

   ```bash
   locust
   ```
5. View the results live in the log output, and in `/results` after the test run completes.