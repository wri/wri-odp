import json
from urllib.parse import quote
import logging


log = logging.getLogger(__name__)


# Constructs a tRPC API call URL with the given name and JSON payload.
def build_trpc_call(name: str, payload: dict) -> str:
    quoted = quote(json.dumps(payload, separators=(",", ":")))
    url = f"/api/trpc/{name}?batch=1&input={quoted}"
    return url


# Validates the response from an API call.
# Supports different modes:
# "trpc" for tRPC calls
# "ckan" for CKAN API calls
# "html" for HTML page loads
# "tile" for map tile requests
def validate_response(r, name, mode="trpc"):
    if r.status_code != 200:
        r.failure(f"{name}: HTTP {r.status_code}")
        return None

    try:
        if mode == "trpc":
            data = r.json()

            if isinstance(data, list):
                has_result = any("result" in item for item in data)
                has_error = any("error" in item for item in data)

                if has_error:
                    r.failure(f"{name}: API error {str(data)[:200]}")
                elif has_result:
                    r.success()
                else:
                    r.failure(f"{name}: no result found {str(data)[:200]}")
            else:
                r.failure(f"{name}: not a list {str(data)[:200]}")

        elif mode == "ckan":
            data = r.json()

            if data.get("success") and "result" in data:
                r.success()
                return data["result"]
            else:
                r.failure(f"{name}: bad CKAN API response {str(data)[:200]}")

        elif mode == "html":
            if "<html" in r.text.lower():
                r.success()
            else:
                r.failure(f"{name}: no HTML detected")

        elif mode == "tile":
            if r.status_code == 200:
                r.success()
            else:
                r.failure(f"{name}: HTTP {r.status_code}")

        return None
    except Exception as e:
        r.failure(f"{name}: parse error {e} ({r.text[:200]})")
        return None
