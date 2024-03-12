#!/bin/bash

set -e

echo "Initializing Postgis"

echo "Loading PostGIS extensions into $CKAN_DB"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" -d "$CKAN_DB" <<-EOSQL
    CREATE EXTENSION postgis;
    ALTER TABLE spatial_ref_sys OWNER TO $CKAN_DB_USER;
EOSQL

echo "Postgis initialized"
