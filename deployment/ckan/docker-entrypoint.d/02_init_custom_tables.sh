#!/bin/bash
# Create WRI extension tables and other plugin tables not covered by `ckan db init`.
# Idempotent: each command no-ops when the table already exists.

set -euo pipefail

CKAN_INI="${CKAN_INI:-/srv/app/production.ini}"

run_ckan_cmd() {
    local cmd=$1
    local required=${2:-required}

    echo "[init_custom_tables] Running: ckan -c ${CKAN_INI} ${cmd}"
    if ckan -c "${CKAN_INI}" ${cmd}; then
        echo "[init_custom_tables] OK: ${cmd}"
        return 0
    fi

    local exit_code=$?
    if [ "${required}" = "required" ]; then
        echo "[init_custom_tables] FAILED (required): ${cmd} (exit ${exit_code})"
        exit "${exit_code}"
    fi

    echo "[init_custom_tables] WARN (optional): ${cmd} failed (exit ${exit_code}), continuing"
    return 0
}

echo "[init_custom_tables] Initializing custom tables..."

run_ckan_cmd "notificationdb"
run_ckan_cmd "pendingdatasetsdb"
run_ckan_cmd "downloadeventdb"
run_ckan_cmd "downloadeventdbupdate" optional
run_ckan_cmd "resourcelocationdb" optional
run_ckan_cmd "issuesdb"

# Alembic migrations for extensions not handled by `db init`.
run_ckan_cmd "db upgrade -p harvest" optional

echo "[init_custom_tables] Custom tables initialized"
