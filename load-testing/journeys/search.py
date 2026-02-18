import random
import urllib.parse
import json
import logging
import requests
import gevent

from locust import task, between, TaskSet, events

import journeys.helpers as helpers


log = logging.getLogger(__name__)


# General search terms that should always return results.
# They seem to work well, but we can adjust as needed.
SEARCH_TERMS = [
    "climate",
    "forest",
    "energy",
    "power",
    "water",
    "agriculture",
    "health",
    "education",
]

# These are not based on any real data related to how many facets users select in the real world.
# I'm just making some assumptions here to simulate a range of user behaviors.
FACET_COUNT_DISTRIBUTION = {
    0: 0.1,  # 0 facets; 10% of searches
    1: 0.25,  # 1 facet; 25% of searches
    2: 0.4,  # 2 facets; 40% of searches
    3: 0.2,  # 3 facets; 20% of searches
    4: 0.05,  # 4+ facets; 5% of searches
}

FACET_OPTIONS = {}


def _normalize_fq(fq, mode="ckan"):
    """
    Normalizes the 'fq' (filter query) parameter for CKAN or tRPC API.
    mode="trpc": return a dict, for tRPC payload
    mode="ckan": return a Solr-ready string, joined by '+'
    """
    if not fq:
        return {} if mode == "trpc" else ""

    out = {}
    clauses = []

    for k, v in fq.items():
        needs_quotes = " " in v and not (v.startswith('"') and v.endswith('"'))
        val = f'"{v}"' if needs_quotes else v

        if mode == "trpc":
            out[k] = val
        elif mode == "ckan":
            clauses.append(f"{k}:{val}")

    return out if mode == "trpc" else "+".join(clauses)


def _distribute_facets():
    # Chooses a number of facets to apply based on a weighted distribution.
    keys = list(FACET_COUNT_DISTRIBUTION.keys())
    weights = list(FACET_COUNT_DISTRIBUTION.values())
    return random.choices(keys, weights=weights, k=1)[0]


@events.test_start.add_listener
def _(environment, **kwargs):
    # Loads facet options at the start of the test.
    # Ensures we have a fresh list of facets and dataset counts.
    global FACET_OPTIONS

    base_url = environment.host
    url = (
        f"{base_url}/api/3/action/package_search"
        "?rows=0&facet=true&facet.limit=-1"
        '&facet.field=["featured_dataset","application","project","organization",'
        '"groups","tags","temporal_coverage","update_frequency","res_format",'
        '"license_id","language","wri_data"]'
    )
    resp = requests.get(url)
    data = {}

    try:
        data = resp.json()["result"]["facets"]
    except Exception as e:
        log.error(f"Failed to load facet options: {e}")
        return

    facet_options = {}

    for field, values in data.items():
        # Sorts from highest to lowest count and uses top 10.
        sorted_counts = sorted(values.items(), key=lambda x: x[1], reverse=True)
        empty_keys_removed = [(k, v) for k, v in sorted_counts if k != ""]
        top_counts = [k for k, _ in empty_keys_removed][:10]

        # Skips facets with no datasets.
        if top_counts:
            facet_options[field] = top_counts

    FACET_OPTIONS = facet_options


class SearchTasks(TaskSet):
    wait_time = between(5, 15)

    def _search(self, search_term="", fq=None, label="search"):
        # Performs a search with optional search term and facets.
        if fq is None:
            fq = {}

        selected_facets = [
            {
                "key": k,
                "title": k.capitalize(),
                "value": v,
                "label": v,
            }
            for k, v in fq.items()
        ]

        search_json = []

        if search_term:
            search_json.append(
                {
                    "title": "Search",
                    "key": "search",
                    "label": search_term,
                    "value": search_term,
                }
            )

        search_json.extend(selected_facets)
        search_param_encoded = urllib.parse.quote(
            json.dumps(search_json, separators=(",", ":"))
        )
        page_param_encoded = urllib.parse.quote(
            json.dumps({"start": 0, "rows": 10}, separators=(",", ":"))
        )
        sort_param = urllib.parse.quote('"score desc"')

        url = f"/search?search={search_param_encoded}&page={page_param_encoded}&sort_by={sort_param}"
        # Searches on the frontend first, which doesn't trigger any tRPC calls like it does in a real browser.
        self.client.get(url, name=f"{label}")

        # Prepares the tRPC API call.
        payload = {
            "0": {
                "json": {
                    "search": search_term,
                    "extLocationQ": "",
                    "extAddressQ": "",
                    "extGlobalQ": "include",
                    "fq": _normalize_fq(fq, mode="trpc"),
                    "page": {"start": 0, "rows": 10},
                    "sortBy": "score desc",
                    "removeUnecessaryDataInResources": True,
                }
            }
        }

        input_str = urllib.parse.quote(json.dumps(payload, separators=(",", ":")))
        api_url = f"/api/trpc/dataset.getAllDataset?batch=1&input={input_str}"

        # Searches via the tRPC API, simulating the frontend data fetch.
        with self.client.get(api_url, name=label, catch_response=True) as r:
            helpers.validate_response(r, label, "trpc")

    @task(3)
    def search_with_terms(self):
        # Searches with a term only, no facets.
        search_term = random.choice(SEARCH_TERMS)
        self._search(search_term=search_term, fq={}, label="search_with_terms")
        self.user.check_session_end()

    @task(1)
    def search_with_facets(self):
        # Searches with facets only, no search term.
        fq = {}
        facet_distribution = _distribute_facets()

        base_url = self.user.environment.host
        available_facets = FACET_OPTIONS.copy()

        # Adds a facet in each iteration to simulate user refining search results.
        for _ in range(facet_distribution):
            if not available_facets:
                break

            # Selects an initial random facet.
            facet_field = random.choice(list(available_facets.keys()))
            facet_value = random.choice(available_facets[facet_field])
            fq[facet_field] = facet_value

            try:
                # Updates available facets based on current selection.
                # Simulates refining search results by selecting additional facets.
                # Ensures that the next facet has datasets in the results.
                facet_url = (
                    f"{base_url}/api/3/action/package_search"
                    "?rows=0&facet=true&facet.limit=-1"
                    f"&fq={_normalize_fq(fq, mode='ckan')}"
                    '&facet.field=["featured_dataset","application","project","organization",'
                    '"groups","tags","temporal_coverage","update_frequency","res_format",'
                    '"license_id","language","wri_data"]'
                )
                resp = requests.get(facet_url)
                new_facets = resp.json()

                if (
                    resp.status_code == 200
                    and new_facets.get("success")
                    and "result" in new_facets
                ):
                    new_facets = new_facets["result"]["facets"]
                    # Builds a new available facets dict, excluding empty facets.
                    available_facets = {
                        field: [
                            k
                            for k, _ in sorted(
                                vals.items(), key=lambda x: x[1], reverse=True
                            )
                            if k != ""
                        ]
                        for field, vals in new_facets.items()
                        if any(vals.values())
                    }
                    # Removes empty lists.
                    available_facets = {k: v for k, v in available_facets.items() if v}
                else:
                    log.error(
                        f"Facet update failed fq={fq}, status={resp.status_code}, body={str(new_facets)[:200]}"
                    )
                    break
            except Exception as e:
                log.error(f"Facet chaining failed at fq={fq}: {e}")
                break

            # Searches via tRPC API with current facets.
            self._search(search_term="", fq=fq, label="search_with_facets_trpc")
            # Attempts to simulates user thinking between facet selections.
            gevent.sleep(random.uniform(3, 7))

        self.user.check_session_end()
