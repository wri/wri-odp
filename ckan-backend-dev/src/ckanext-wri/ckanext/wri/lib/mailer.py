from ckan.lib.mailer import create_reset_key, mail_user, MailerException
from ckan.lib.base import render
from ckan.common import config
import ckan.model as model

def get_reset_link(user: model.User) -> str:
    odp_url = config.get('ckanext.wri.odp_url')
    return "{}/auth/password-reset?token={}&user_id={}".format(odp_url, user.reset_key, user.id)

def get_reset_link_body(user: model.User) -> str:
    extra_vars = {
        'reset_link': get_reset_link(user),
        'site_title': "WRI Open Data Portal",
        'site_url': config.get('ckanext.wri.odp_url'),
        'user_name': user.name,
    }
    # NOTE: This template is translated
    return render('emails/reset_password.txt', extra_vars)

def send_reset_link(user: model.User) -> None:
    create_reset_key(user)
    body = get_reset_link_body(user)
    extra_vars = {
        'site_title': config.get('ckan.site_title')
    }
    subject = render('emails/reset_password_subject.txt', extra_vars)

    # Make sure we only use the first line
    subject = subject.split('\n')[0]

    mail_user(user, subject, body, body)
