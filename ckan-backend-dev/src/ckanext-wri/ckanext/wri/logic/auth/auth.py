import ckan.authz as authz
import ckan.plugins.toolkit as tk
from ckan.types import Context, DataDict, AuthResult
from ckan.logic.auth.create import _check_group_auth
from ckan.common import _
import ckan.logic.auth as logic_auth


def _package_update(context: Context, data_dict: DataDict) -> AuthResult:
    model = context["model"]
    user = context.get("user")

    package = logic_auth.get_package_object(context, data_dict)
    if package.owner_org:
        # if there is an owner org then we must have update_dataset
        # permission for that organization
        check1 = authz.has_user_permission_for_group_or_org(
            package.owner_org, user, "update_dataset"
        )
    else:
        check1 = False
    #    # If dataset is not owned then we can edit if config permissions allow
    #    if authz.auth_is_anon_user(context):
    #        check1 = all(authz.check_config_permission(p) for p in (
    #            'anon_create_dataset',
    #            'create_dataset_if_not_in_organization',
    #            'create_unowned_dataset',
    #            ))
    #    else:
    #        check1 = all(authz.check_config_permission(p) for p in (
    #            'create_dataset_if_not_in_organization',
    #            'create_unowned_dataset',
    #            )) or authz.has_user_permission_for_some_org(
    #            user, 'create_dataset')

    if not check1:
        success = False
        if authz.check_config_permission("allow_dataset_collaborators"):
            # if org-level auth failed, check dataset-level auth
            # (ie if user is a collaborator)
            user_obj = model.User.get(user)
            if user_obj:
                if user_obj.id == package.creator_user_id:
                    return {"success": True}
                success = authz.user_is_collaborator_on_dataset(
                    user_obj.id, package.id, ["admin", "editor"]
                )
        if not success:
            return {
                "success": False,
                "msg": _("User %s not authorized to edit package %s")
                % (str(user), package.id),
            }
    else:
        check2 = _check_group_auth(context, data_dict)
        if not check2:
            return {
                "success": False,
                "msg": _("User %s not authorized to edit these groups") % (str(user)),
            }

    return {"success": True}


@tk.chained_auth_function
def package_create(up_func, context, data_dict):
    """
    Only allow the creation of packages if the approval status is set as pending and the is_approved flag is false
    """
    if data_dict and (
        data_dict.get("visibility_type") != "private"
        and data_dict.get("visibility_type") != "draft"
    ):
        if data_dict.get("approval_status") != "pending" or (
            data_dict.get("is_approved") != False
            and data_dict.get("is_approved") is not None
        ):
            return {
                "success": False,
                "msg": _(
                    "All packages must go thru the approval workflow to be created, please set the approval_status to 'pending' and is_approved to 'false'"
                ),
            }
    return up_func(context, data_dict)


@tk.chained_auth_function
def package_update(up_func, context, data_dict):
    """
    Only allow the updating directly of packages if the user is an admin in the org or in the package
    """
    user = context.get("user")
    model = context["model"]
    user_obj = model.User.get(user)
    package = logic_auth.get_package_object(context, data_dict)
    if (
        data_dict
        and data_dict.get("visibility_type") != "private"
        and data_dict.get("visibility_type") != "draft"
    ):
        if package.owner_org:
            # if there is an owner org then we must have update_dataset
            # permission for that organization
            if authz.users_role_for_group_or_org(package.owner_org, user) != "admin":
                return {
                    "success": False,
                    "msg": _("User %s not authorized to edit package %s")
                    % (str(user), package.id),
                }
        else:
            if authz.check_config_permission("allow_dataset_collaborators"):
                # if org-level auth failed, check dataset-level auth
                # (ie if user is a collaborator)
                if user_obj:
                    if user_obj.id == package.creator_user_id:
                        print("CREATOR ID")
                        return {"success": True}
                    if (
                        authz.user_is_collaborator_on_dataset(
                            user_obj.id, package.id, ["admin"]
                        )
                        == False
                    ):
                        return {
                            "success": False,
                            "msg": _("User %s not authorized to edit package %s")
                            % (str(user), package.id),
                        }
    print(
        authz.user_is_collaborator_on_dataset(user_obj.id, package.id, ["admin"]),
        flush=True,
    )
    return _package_update(context, data_dict)


@tk.auth_allow_anonymous_access
def notification_get_all(context: Context, data_dict: DataDict) -> AuthResult:
    if context.get("user"):
        return {"success": True}
    else:
        return {
            "success": False,
            "msg": tk._("You must be logged in to access the notifications."),
        }


@tk.auth_allow_anonymous_access
def notification_create(context: Context, data_dict: DataDict) -> AuthResult:
    return tk.check_access("notification_get_all", context, data_dict)


def pending_dataset_create(context: Context, data_dict: DataDict) -> AuthResult:
    print("PENDING DATASET UPDATE", flush=True)
    print(data_dict, flush=True)
    return tk.check_access("package_create", context, data_dict)


def pending_dataset_show(context: Context, data_dict: DataDict) -> AuthResult:
    dataset_id = data_dict.get("dataset_id")
    if dataset_id:
        data_dict["id"] = dataset_id
    if tk.check_access("package_show", context, data_dict):
        return {"success": True}
    else:
        return {
            "success": False,
            "msg": tk._("Unauthorized to access pending dataset."),
        }


def pending_dataset_update(context: Context, data_dict: DataDict) -> AuthResult:
    print("PENDING DATASET UPDATE", flush=True)
    print(data_dict, flush=True)
    return tk.check_access("package_update", context, data_dict)


def pending_dataset_delete(context: Context, data_dict: DataDict) -> AuthResult:
    return tk.check_access("package_delete", context, data_dict)

def package_collaborator_list(context: Context, data_dict: DataDict) -> AuthResult:
    return tk.check_access("package_show", context, data_dict)
