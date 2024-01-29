
# Initialize Issues and Notification DB
docker exec ckan-wri sh -c "ckan -c production.ini issuesdb"
docker exec ckan-wri sh -c "ckan -c production.ini notificationdb"
docker exec ckan-wri sh -c "ckan -c production.ini pendingdatasetsdb"
docker exec ckan-wri sh -c "unset CKAN__DATAPUSHER__API_TOKEN"
docker cp ./ckan-backend-dev/ckan/scripts/datapusher.sh ckan-wri:/srv/app/datapusher.sh
echo "Adding +x permissions"
docker exec ckan-wri sh -c "chmod +x /srv/app/datapusher.sh"
docker exec ckan-wri sh -c "/srv/app/datapusher.sh"
