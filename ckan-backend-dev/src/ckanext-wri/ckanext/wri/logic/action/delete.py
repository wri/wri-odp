import logging

from ckan.types import Context, DataDict
import ckan.plugins.toolkit as tk
from ckan.common import _

from ckanext.wri.model.pending_datasets import PendingDatasets

log = logging.getLogger(__name__)


def pending_dataset_delete(context: Context, data_dict: DataDict):
    """Delete a Pending Dataset"""
    package_id = data_dict.get("package_id")

    if not package_id:
        raise tk.ValidationError(_("package_id is required"))

    tk.check_access("pending_dataset_delete", context, {"id": package_id})

    pending_dataset = None
    try:
        pending_dataset = PendingDatasets.delete(package_id)
    except Exception as e:
        log.error(e)
        raise tk.ValidationError(e)

    if not pending_dataset:
        raise tk.ValidationError(_(f"Pending Dataset not found: {package_id}"))
    # was returining pending_dataset db object
    # change to return package_id or can  none either way
    return package_id
