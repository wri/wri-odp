#!/usr/bin/env python3
"""
Seed the local CKAN instance with a test team (organization) and a dataset
with two CSV resources uploaded to local Minio.

Usage:
    python seed.py [--api-key <token>] [--ckan-url <url>]

Defaults:
    --ckan-url  http://localhost:5000
    --api-key   read from CKAN_API_KEY env var or prompted interactively
"""

import argparse
import io
import os
import sys
import requests

CKAN_URL = "http://localhost:5000"
API_BASE = f"{CKAN_URL}/api/3/action"


def api(action: str, token: str, data: dict) -> dict:
    resp = requests.post(
        f"{API_BASE}/{action}",
        json=data,
        headers={"Authorization": token},
    )
    body = resp.json()
    if not body.get("success"):
        error = body.get("error", body)
        raise RuntimeError(f"{action} failed: {error}")
    return body["result"]


def api_upload(action: str, token: str, fields: dict, filename: str, content: bytes) -> dict:
    resp = requests.post(
        f"{API_BASE}/{action}",
        data=fields,
        files={"upload": (filename, io.BytesIO(content), "text/csv")},
        headers={"Authorization": token},
    )
    body = resp.json()
    if not body.get("success"):
        raise RuntimeError(f"{action} (upload) failed: {body.get('error', body)}")
    return body["result"]


def get_or_create_org(token: str) -> str:
    name = "wri-test-team"
    try:
        result = api("organization_show", token, {"id": name})
        print(f"  Organization already exists: {result['id']}")
        return result["id"]
    except RuntimeError:
        pass

    result = api("organization_create", token, {
        "name": name,
        "title": "WRI Test Team",
        "description": "Local dev seed organization",
    })
    print(f"  Created organization: {result['id']}")
    return result["id"]


def get_or_create_dataset(token: str, owner_org: str) -> str:
    name = "test-bulk-download"
    try:
        result = api("package_show", token, {"id": name})
        print(f"  Dataset already exists: {result['id']}")
        return result["id"]
    except RuntimeError:
        pass

    import json
    result = api("package_create", token, {
        "name": name,
        "title": "Test Bulk Download",
        "notes": "Created by seed.py for local development testing.",
        "short_description": "Seed dataset for testing bulk download locally.",
        "technical_notes": "https://example.com/technical-notes",
        "authors": json.dumps([{"name": "Seed Script", "email": "seed@example.com"}]),
        "maintainers": json.dumps([{"name": "Seed Script", "email": "seed@example.com"}]),
        "owner_org": owner_org,
        "approval_status": "approved",
        "visibility_type": "public",
        "featured_dataset": False,
        "update_frequency": "as_needed",
    })
    print(f"  Created dataset: {result['id']}")
    return result["id"]


def csv_bytes(header: str, rows: "list[str]") -> bytes:
    lines = [header] + rows
    return "\n".join(lines).encode()


def seed_resources(token: str, dataset_id: str) -> None:
    resources = [
        {
            "name": "cities.csv",
            "content": csv_bytes(
                "city,country,population",
                ["New York,USA,8336817", "London,UK,8982000", "Tokyo,Japan,13960000"],
            ),
        },
        {
            "name": "temperatures.csv",
            "content": csv_bytes(
                "city,jan,jul",
                ["New York,-2,25", "London,5,19", "Tokyo,5,28"],
            ),
        },
    ]

    existing = api("package_show", token, {"id": dataset_id})
    existing_names = {r["name"] for r in existing.get("resources", [])}

    for res in resources:
        if res["name"] in existing_names:
            print(f"  Resource already exists: {res['name']}")
            continue

        result = api_upload(
            "resource_create",
            token,
            {"package_id": dataset_id, "name": res["name"], "format": "CSV"},
            res["name"],
            res["content"],
        )
        print(f"  Created resource: {result['id']} ({res['name']})")


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed local CKAN with test data.")
    parser.add_argument("--ckan-url", default=os.getenv("CKAN_URL", CKAN_URL))
    parser.add_argument("--api-key", default=os.getenv("CKAN_API_KEY", ""))
    args = parser.parse_args()

    global API_BASE
    API_BASE = f"{args.ckan_url}/api/3/action"

    token = args.api_key
    if not token:
        token = input("Enter your CKAN sysadmin API token: ").strip()
    if not token:
        print("No API token provided.", file=sys.stderr)
        sys.exit(1)

    print("\n→ Creating organization...")
    org_id = get_or_create_org(token)

    print("→ Creating dataset...")
    dataset_id = get_or_create_dataset(token, org_id)

    print("→ Uploading resources...")
    seed_resources(token, dataset_id)

    print(f"\n✓ Done. Visit http://localhost:3000/datasets/{dataset_id} to test bulk download.\n")


if __name__ == "__main__":
    main()
