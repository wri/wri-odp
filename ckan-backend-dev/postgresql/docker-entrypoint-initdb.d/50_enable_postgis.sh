#!/bin/bash

set -e

echo "Initializing Postgis"

# Load PostGIS into both template_database and $POSTGRES_DB
for DB in "$CKAN_DB"; do
	echo "Loading PostGIS extensions into $DB"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
		CREATE EXTENSION IF NOT EXISTS postgis;
		-- CREATE EXTENSION IF NOT EXISTS postgis_topology;
		-- Reconnect to update pg_setting.resetval
		-- See https://github.com/postgis/docker-postgis/issues/288
		-- CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
		-- CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder;
EOSQL
done

echo "Postgis initialized"
