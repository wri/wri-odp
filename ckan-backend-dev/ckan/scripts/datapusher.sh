echo "Changing Datapusher API Key"
ckan config-tool production.ini ckan.datapusher.api_token=$(ckan -c production.ini user token add ckan_admin datapusher | tail -n 1 | tr -d '\t')

