import ckan.authz as authz
import ckan.plugins.toolkit as tk
from ckan.types import Context, DataDict, AuthResult


@tk.auth_allow_anonymous_access
def notification_get_all(
    context: Context, data_dict: DataDict
) -> AuthResult:
    if context.get("user"):
        return {"success": True}
    else:
        return {
            "success": False,
            "msg": tk._("You must be logged in to access the notifications."),
        }


@tk.auth_allow_anonymous_access
def notification_create(
    context: Context, data_dict: DataDict
) -> AuthResult:
    return tk.check_access("notification_get_all", context, data_dict)
