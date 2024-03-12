#!/bin/bash

set -e

echo "Initializing Postgis"

echo "Loading PostGIS extensions into $CKAN_DB"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE EXTENSION postgis;
EOSQL

echo "Postgis initialized"
