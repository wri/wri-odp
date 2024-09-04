import json

from ckan.types import DataDict


def stringify_actor_objects(data_dict: DataDict) -> DataDict:
    authors = data_dict.get("authors")
    maintainers = data_dict.get("maintainers")

    if authors and isinstance(authors, list):
        data_dict["authors"] = json.dumps(authors)

    if maintainers and isinstance(maintainers, list):
        data_dict["maintainers"] = json.dumps(maintainers)

    return data_dict
