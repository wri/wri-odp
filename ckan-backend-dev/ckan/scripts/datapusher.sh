echo "Changing Datapusher API Key"
echo $(ckan -c production.ini user token add ckan_admin datapusher_test | tail -n 1 | tr -d '\t')
ckan config-tool production.ini ckan.datapusher.api_token=$(ckan -c production.ini user token add ckan_admin datapusher | tail -n 1 | tr -d '\t')
cat production.ini | grep api_token

