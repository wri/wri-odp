#!/usr/bin/env bash
# Provision CKAN RDS databases/users from k8s secrets (empty fresh DB on dx-ckan-db-prod).
# Then run ckan db init, postgis, custom tables, and optional ckan_admin bootstrap.
#
# Usage (staging):
#   KUBE_NAMESPACE=wri-odp-staging \
#   CKAN_DEPLOY=deploy/wri-staging-ckan \
#   CKAN_SECRET=wri-staging-ckan-envvars \
#   HASURA_SECRET=wri-staging-hasura-envvars \
#   ./scripts/provision-cluster-ckan-db.sh
#
# Usage (dev — skips create if DB already exists):
#   ./scripts/provision-cluster-ckan-db.sh
set -euo pipefail

CTX="${KUBE_CONTEXT:-arn:aws:eks:us-east-1:245948672511:cluster/ckan-prod}"
NS="${KUBE_NAMESPACE:-wri-odp-dev}"
CKAN_POD="${CKAN_POD:-deploy/wri-dev-ckan}"
CKAN_SECRET="${CKAN_SECRET:-wri-dev-ckan-envvars}"
HASURA_SECRET="${HASURA_SECRET:-wri-dev-hasura-envvars}"
SQL_SECRET="${SQL_SECRET:-ckan-cloud-centeralized-sql}"
CKAN_INI="${CKAN_INI:-/srv/app/production.ini}"
CKAN_ADMIN="${CKAN_ADMIN:-ckan_admin}"
CKAN_ADMIN_EMAIL="${CKAN_ADMIN_EMAIL:-admin@example.com}"
CKAN_ADMIN_PASSWORD="${CKAN_ADMIN_PASSWORD:-test1234}"

kubectl_cmd() {
	kubectl --context "$CTX" -n "$NS" "$@"
}

secret_val() {
	local secret=$1 key=$2
	kubectl_cmd get secret "$secret" -o "jsonpath={.data.${key}}" | base64 -d | tr -d '\r\n'
}

parse_url() {
	local url=$1 field=$2
	python3 -c "
import urllib.parse, sys
p = urllib.parse.urlparse(sys.argv[1])
field = sys.argv[2]
if field == 'user': print(p.username or '')
elif field == 'password': print(p.password or '')
elif field == 'host': print(p.hostname or '')
elif field == 'db': print(p.path.lstrip('/').split('?')[0])
" "$url" "$field"
}

psql_postgres() {
	local sql=$1
	kubectl_cmd exec "$CKAN_POD" -- env PGPASSWORD="$PG_SUPER_PASS" \
		psql -h "$PG_HOST" -U "$PG_SUPER_USER" -d postgres -v ON_ERROR_STOP=1 -c "$sql"
}

psql_postgres_quiet() {
	local sql=$1
	kubectl_cmd exec "$CKAN_POD" -- env PGPASSWORD="$PG_SUPER_PASS" \
		psql -h "$PG_HOST" -U "$PG_SUPER_USER" -d postgres -qtA -c "$sql" 2>/dev/null || true
}

ensure_role() {
	local user=$1 pass=$2
	if [ "$(psql_postgres_quiet "SELECT 1 FROM pg_roles WHERE rolname = '${user}'")" != "1" ]; then
		echo "==> Creating role ${user}"
		psql_postgres "CREATE USER \"${user}\" WITH PASSWORD '${pass}';"
	else
		echo "==> Updating password for role ${user}"
		psql_postgres "ALTER USER \"${user}\" WITH PASSWORD '${pass}';"
	fi
}

ensure_db() {
	local user=$1 db=$2
	if [ "$(psql_postgres_quiet "SELECT 1 FROM pg_database WHERE datname = '${db}'")" != "1" ]; then
		echo "==> Creating database ${db}"
		psql_postgres "CREATE DATABASE \"${db}\" OWNER \"${user}\";"
	else
		echo "==> Database ${db} already exists"
	fi
}

run_ckan() {
	local cmd=$1
	local required=${2:-required}
	echo "==> ckan ${cmd}"
	if kubectl_cmd exec "$CKAN_POD" -- ckan -c "$CKAN_INI" ${cmd}; then
		echo "    OK"
		return 0
	fi
	local exit_code=$?
	if [ "$required" = "required" ]; then
		echo "    FAILED (exit ${exit_code})"
		exit "$exit_code"
	fi
	echo "    WARN (optional, exit ${exit_code})"
	return 0
}

echo "==> Provisioning CKAN databases in ${NS} (${CKAN_POD})"

PG_HOST="$(secret_val "$SQL_SECRET" POSTGRES_HOST)"
PG_SUPER_USER="$(secret_val "$SQL_SECRET" POSTGRES_SUPER_USER)"
PG_SUPER_PASS="$(secret_val "$SQL_SECRET" POSTGRES_SUPER_USER_PASSWORD)"

MAIN_URL="$(secret_val "$CKAN_SECRET" CKAN_SQLALCHEMY_URL)"
DS_WRITE_URL="$(secret_val "$CKAN_SECRET" CKAN__DATASTORE__WRITE_URL)"
DS_READ_URL="$(secret_val "$CKAN_SECRET" CKAN__DATASTORE__READ_URL)"
HASURA_URL="$(secret_val "$HASURA_SECRET" HASURA_GRAPHQL_DATABASE_URL)"

MAIN_USER="$(parse_url "$MAIN_URL" user)"
MAIN_PASS="$(parse_url "$MAIN_URL" password)"
MAIN_DB="$(parse_url "$MAIN_URL" db)"

DS_WRITE_USER="$(parse_url "$DS_WRITE_URL" user)"
DS_WRITE_PASS="$(parse_url "$DS_WRITE_URL" password)"
DS_DB="$(parse_url "$DS_WRITE_URL" db)"

DS_READ_USER="$(parse_url "$DS_READ_URL" user)"
DS_READ_PASS="$(parse_url "$DS_READ_URL" password)"

HASURA_USER="$(parse_url "$HASURA_URL" user)"
HASURA_PASS="$(parse_url "$HASURA_URL" password)"
HASURA_DB="$(parse_url "$HASURA_URL" db)"

ensure_role "$MAIN_USER" "$MAIN_PASS"
ensure_db "$MAIN_USER" "$MAIN_DB"
ensure_role "$DS_WRITE_USER" "$DS_WRITE_PASS"
ensure_db "$DS_WRITE_USER" "$DS_DB"
ensure_role "$DS_READ_USER" "$DS_READ_PASS"
ensure_role "$HASURA_USER" "$HASURA_PASS"
ensure_db "$HASURA_USER" "$HASURA_DB"

echo "==> Enabling PostGIS on ${MAIN_DB}"
kubectl_cmd exec "$CKAN_POD" -- env PGPASSWORD="$PG_SUPER_PASS" psql -h "$PG_HOST" -U "$PG_SUPER_USER" -d "$MAIN_DB" -v ON_ERROR_STOP=1 -c \
	"CREATE EXTENSION IF NOT EXISTS postgis; CREATE EXTENSION IF NOT EXISTS postgis_topology;"

CKAN_HAS_TABLES="$(kubectl_cmd exec "$CKAN_POD" -- psql "$MAIN_URL" -qtA -c "SELECT to_regclass('\"user\"');" 2>/dev/null || true)"

if [ -z "$CKAN_HAS_TABLES" ]; then
	echo "==> Initializing CKAN schema (db init)"
	run_ckan "db init"
else
	echo "==> CKAN tables present, running db upgrade"
	run_ckan "db upgrade"
fi

echo "==> Datastore permissions"
run_ckan "datastore set-permissions" optional

echo "==> Custom WRI tables"
KUBE_CONTEXT="$CTX" KUBE_NAMESPACE="$NS" CKAN_POD="$CKAN_POD" CKAN_INI="$CKAN_INI" \
	"$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/init-ckan-custom-tables.sh"

if ! kubectl_cmd exec "$CKAN_POD" -- ckan -c "$CKAN_INI" user show "$CKAN_ADMIN" >/dev/null 2>&1; then
	echo "==> Creating sysadmin ${CKAN_ADMIN}"
	kubectl_cmd exec "$CKAN_POD" -- ckan -c "$CKAN_INI" user add "$CKAN_ADMIN" \
		email="$CKAN_ADMIN_EMAIL" password="$CKAN_ADMIN_PASSWORD"
	kubectl_cmd exec "$CKAN_POD" -- ckan -c "$CKAN_INI" sysadmin add "$CKAN_ADMIN"
else
	echo "==> Sysadmin ${CKAN_ADMIN} already exists"
fi

echo "==> Restarting CKAN to pick up DB connectivity"
kubectl_cmd rollout restart "$CKAN_POD"
kubectl_cmd rollout status "$CKAN_POD" --timeout=300s

echo "==> Done provisioning ${MAIN_DB} on ${PG_HOST}"
