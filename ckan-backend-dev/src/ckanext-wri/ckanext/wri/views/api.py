import logging
from flask import Blueprint
import requests
import threading
import json
import hashlib
import six
import uuid

import ckan.logic as logic
import ckan.plugins.toolkit as tk
import ckan.views.api as api
from ckan.common import g

import ckanext.wri.plugin as wri_plugin

log = logging.getLogger(__name__)

wri = Blueprint('wri', 'wri')


def _post_analytics(user):
    user = user or tk.c.user

    if not user:
        cid = uuid.uuid4().hex
    else:
        cid = hashlib.md5(six.ensure_binary(user)).hexdigest()

    data = {
        'client_id': cid,
        'events': [
            {
                'name': 'ckan_api',
                'params': {
                    'action': tk.request.environ['PATH_INFO'].split('/')[-1],
                    'user_agent': tk.request.environ.get('HTTP_USER_AGENT', ''),
                    'session_id': uuid.uuid4().hex,
                    'engagement_time_msec': 1,
                },
            }
        ],
    }

    wri_plugin.WriApiTracking.analytics_queue.put(data)


def action(logic_function, ver=api.API_MAX_VERSION):
    from_frontend = tk.request.headers.get('X-From-Frontend-Portal', False)
    # Debugging logs
    #log.info('API action called')
    #log.info(f'action: {logic_function}')
    #log.info(f'from_frontend: {from_frontend}')
    #log.info(f'user_agent: {tk.request.environ.get("HTTP_USER_AGENT", "")}')
    user_agent = tk.request.environ.get('HTTP_USER_AGENT', '')

    if user_agent:
        user_agent = user_agent.lower()

    if from_frontend is False:
        function = logic.get_action(logic_function)
        side_effect_free = getattr(function, 'side_effect_free', False)
        request_data = api._get_request_data(try_url_params=side_effect_free)

        if isinstance(request_data, dict) and (
            function != 'status_show' and 'uptime-kuma' not in user_agent
        ):
            _post_analytics(g.user)

    return api.action(logic_function, ver)


wri.add_url_rule(
    '/api/action/<logic_function>',
    methods=['GET', 'POST'],
    view_func=action,
)
wri.add_url_rule(
    u'/api/<int(min=1, max={0}):ver>/action/<logic_function>'.format(
        api.API_MAX_VERSION
    ),
    methods=['GET', 'POST'],
    view_func=action,
)
wri.add_url_rule(
    u'/<int(min=3, max={0}):ver>/action/<logic_function>'.format(api.API_MAX_VERSION),
    methods=['GET', 'POST'],
    view_func=action,
)


class AnalyticsPostThread(threading.Thread):
    '''Threaded Url POST'''

    def __init__(self, queue):
        threading.Thread.__init__(self)
        self.queue = queue

    def run(self):
        while True:
            data = self.queue.get()
            measurement_id = tk.config.get('ckanext.wri.api_analytics.measurement_id')
            api_secret = tk.config.get('ckanext.wri.api_analytics.api_secret')

            if measurement_id and api_secret:
                log.info('Sending API event to Google Analytics: GA4')
                res = requests.post(
                    f'https://www.google-analytics.com/mp/collect?measurement_id={measurement_id}&api_secret={api_secret}',
                    data=json.dumps(data),
                    timeout=10,
                )

            # signals to queue job is done
            self.queue.task_done()
