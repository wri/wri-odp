from typing import Optional, TypedDict
import ckan.model as model
import ckan.plugins.toolkit as tk
from ckan.common import config


class GroupNotificationParams(TypedDict):
    owner_org: Optional[str]
    creator_id: str
    collaborator_id: str
    dataset_id: str
    session: str
    action: str


def get_all_users():
    import sqlalchemy

    _select = sqlalchemy.sql.select
    _func = sqlalchemy.func
    return model.Session.query(
        model.User,
        model.User.name.label("name"),
        model.User.fullname.label("fullname"),
        model.User.about.label("about"),
        model.User.email.label("email"),
        model.User.created.label("created"),
        _select(_func.count(model.Package.id))
        .where(
            model.Package.creator_user_id == model.User.id,
            model.Package.state == "active",
            model.Package.private == False,
        )
        .label("number_created_packages"),
    ).all()


def send_group_notification(context, GroupNotificationParams):
    recipient_ids = []
    recipient_users = []
    owner_org = GroupNotificationParams.get("owner_org")
    creator_id = GroupNotificationParams.get("creator_id", None)
    collaborator_id = GroupNotificationParams.get("collaborator_id")
    dataset_id = GroupNotificationParams.get("dataset_id")
    action = GroupNotificationParams.get("action")
    if owner_org:
        _context = context.copy()
        _context["ignore_auth"] = True
        org = tk.get_action("organization_show")(_context, {"id": owner_org})
        org_users = org["users"]
        recipient_users = list(
            filter(
                lambda u: u["capacity"] == "admin" or u["capacity"] == "member",
                org_users,
            )
        )
        recipient_ids = list(map(lambda u: u["id"], recipient_users))
    if not any(user["id"] == creator_id for user in recipient_users) and creator_id:
        recipient_ids.append(creator_id)
        creator_user = tk.get_action("user_show")(context, {"id": creator_id})
        if recipient_users:
            recipient_users.append(creator_user)
        else:
            recipient_users = [creator_user]
    if collaborator_id:
        recipient_ids.extend(collaborator_id)
        collaborator_users = [
            tk.get_action("user_show")(context, {"id", id}) for id in collaborator_id
        ]

        if recipient_users:
            recipient_users.extend(collaborator_users)
        else:
            recipient_users = collaborator_users

    # get all admin users
    all_users = tk.get_action("user_list")(
        {**context, **{"ignore_auth": True}}, {"all_fields": True}
    )
    all_users = [
        user
        for user in all_users
        if not any(s["id"] == user["id"] for s in recipient_users) and user["sysadmin"]
    ]
    all_user_ids = [user["id"] for user in all_users]
    recipient_ids.extend(all_user_ids)

    if recipient_users:
        recipient_users.extend(all_users)
    else:
        recipient_users = all_users

    dataset = tk.get_action("package_show")(context, {"id": dataset_id})
    if len(recipient_ids) > 0:
        notifications_sent = [
            tk.get_action("notification_create")(
                context,
                {
                    "recipient_id": recipient_id,
                    "sender_id": creator_id if creator_id else '',
                    "activity_type": action,
                    "object_type": "dataset",
                    "object_id": dataset_id,
                    "is_unread": True,
                },
            )
            for recipient_id in recipient_ids
        ]
        if recipient_users:
            for recipient_user in recipient_users:
                if recipient_user.get("email"):
                    user_obj = model.User.get(recipient_user.get("id"))
                    mainAction = action.split("_")[0]
                    subject = f"Approval status on dataset {dataset['title']}"
                    body = f"""
                    <p>Hi {
                                recipient_user['display_name'] if recipient_user.get('display_name') else recipient_user['name']
                            }</p>
                        <p>The approval status for the dataset <a href="{
                            config.get("ckanext.wri.frontend_url")
                        }/datasets/{dataset['name']}">${
                            dataset['title']
                        }</a> is now <b><strong>${mainAction}</strong><b></p>
                    """
                    tk.mail_user(user_obj, subject, body)
