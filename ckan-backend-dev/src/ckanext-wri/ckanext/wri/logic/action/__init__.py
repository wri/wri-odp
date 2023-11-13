import ckan.plugins.toolkit as tk
import ckan.logic as logic
import ckanext.wri.lib.mailer as mailer
from ckan.types import Context
from ckan.common import _


ValidationError = logic.ValidationError

import logging

log = logging.getLogger(__name__)

def password_reset(context: Context, data_dict: [str, any]):
    email = data_dict.get("email", False)
    
    if not email:
        raise ValidationError({"email": [_("Please provide an email address")]})
    model = context['model']
    session = context['session']

    user = session.query(model.User).filter_by(email=email).all()

    if not user:
        # Do not leak whether the email is registered or not
        return "Password reset link sent to email address"

    try:
        mailer.send_reset_link(user[0])
        return "Password reset link sent to email address"
    except mailer.MailerException as e:
        log.exception(e)
        return "Password reset link sent to email address"
