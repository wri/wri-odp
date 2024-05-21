from ckan.common import config
import ckan.plugins.toolkit as tk
import json
import requests


def create_dataset_rw(dataset):
    rw_dataset = {
        "name": dataset.get("title", ""),
        "connectorType": dataset["connectorType"],
        "provider": dataset["provider"],
        "published": False,
        "env": "staging",
        "application": ["data-explorer"],
        "connectorUrl": dataset.get("connectorUrl", ""),
        "tableName": dataset.get("tableName", ""),
    }
    body = json.dumps({"dataset": rw_dataset})

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {config.get('ckanext.wri.rw_api_key')}",
    }

    response = requests.post(
        "https://api.resourcewatch.org/v1/dataset", headers=headers, data=body
    )

    dataset_rw = response.json()
    if "errors" in dataset_rw:
        raise tk.Invalid(json.dumps(dataset_rw["errors"]))

    return dataset_rw.get("data")


def create_layer_rw(r, dataset_rw_id):
    if not r.get("layer"):
        return r

    url = f"https://api.resourcewatch.org/v1/dataset/{dataset_rw_id}/layer"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {config.get('ckanext.wri.rw_api_key')}",
    }
    body = r["layer"]
    response = requests.post(url, headers=headers, data=json.dumps(body))

    layer_rw = response.json()

    if "errors" in layer_rw:
        raise tk.Invalid(json.dumps(layer_rw["errors"]))

    if "data" not in layer_rw or "attributes" not in layer_rw["data"]:
        raise tk.Invalid("Invalid response from RW API")

    attributes = layer_rw["data"]["attributes"]
    r["url"] = (
        f"https://api.resourcewatch.org/v1/dataset/{attributes['dataset']}/layer/{layer_rw['data']['id']}"
    )
    r["name"] = layer_rw["data"]["id"]
    r["title"] = r.get("name", "") if r.get("name") else attributes["name"]

    if r.get("layer"):
        r["title"] = attributes["name"]

    r["description"] = (
        r.get("description", "") if r.get("description") else attributes["description"]
    )
    r["rw_id"] = layer_rw["data"]["id"]
    r["format"] = "Layer"

    return r


def edit_layer_rw(r):
    if not r.get("layer") or not r.get("rw_id"):
        return r

    try:
        if r.get("layer") and r.get("url"):
            url = r["url"]
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {config.get('ckanext.wri.rw_api_key')}",
            }
            body = json.dumps(r["layer"])
            response = requests.patch(url, headers=headers, data=body)

            layer_rw = response.json()

            if "errors" in layer_rw:
                raise tk.Invalid(
                    f"Error creating resource at the Resource Watch API - ({json.dumps(layer_rw['errors'])})"
                )

            attributes = layer_rw["data"]["attributes"]
            title = attributes["name"]
            description = attributes["description"]
            r["title"] = r.get("title", "") if r.get("title") else title
            r["description"] = (
                r.get("description", "") if r.get("description") else description
            )
            r["format"] = "Layer"

            return r

    except Exception as e:
        error_message = (
            "Something went wrong when we tried to create some resources in the Resource Watch API. "
            "Please contact the system administrator"
        )
        if isinstance(e, Exception):
            error_message = str(e)
        raise tk.Invalid(error_message)

    return r
