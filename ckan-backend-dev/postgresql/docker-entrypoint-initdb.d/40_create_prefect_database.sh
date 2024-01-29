#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE EXTENSION pgcrypto;
    CREATE DATABASE prefect OWNER "$CKAN_DB_USER" ENCODING 'utf-8';
EOSQL
