
# Initialize Issues and Notification DB
docker exec ckan-wri sh -c "ckan -c production.ini issuesdb"
docker exec ckan-wri sh -c "ckan -c production.ini notificationdb"
docker exec ckan-wri sh -c "ckan -c production.ini pendingdatasetsdb"
docker exec ckan-wri sh -c "unset CKAN__DATAPUSHER__API_TOKEN"
docker exec ckan-wri sh -c "ckan config-tool production.ini ckan.datapusher.api_token=$(ckan -c production.ini user token add ckan_admin datapusher | tail -n 1 | tr -d '\t')"
