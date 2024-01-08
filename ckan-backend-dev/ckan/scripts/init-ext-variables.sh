
# Initialize Issues and Notification DB
docker exec ckan-wri sh -c "ckan -c production.ini issuesdb"
docker exec ckan-wri sh -c "ckan -c production.ini notificationdb"

# Enable Hasura Variables
docker exec ckan-wri ckan config-tool /srv/app/production.ini "ckanext.data_api.hasura_url = http://hasura-svc:80"
docker exec ckan-wri ckan config-tool /srv/app/production.ini "ckanext.data_api.admin_key = test123546789"
docker exec ckan-wri ckan config-tool /srv/app/production.ini "ckanext.data_api.hasura_db = WRI Datastore"
