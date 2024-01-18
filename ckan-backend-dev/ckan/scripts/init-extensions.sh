
# Initialize Issues and Notification DB
docker exec ckan-wri sh -c "ckan -c production.ini issuesdb"
docker exec ckan-wri sh -c "ckan -c production.ini notificationdb"
docker exec ckan-wri sh -c "ckan -c production.ini pendingdatasetsdb"
