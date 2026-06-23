#!/usr/bin/env bash
# Create WRI custom tables on a running CKAN pod (same steps as docker-entrypoint.d/02_init_custom_tables.sh).
set -euo pipefail

CTX="${KUBE_CONTEXT:-arn:aws:eks:us-east-1:245948672511:cluster/ckan-prod}"
NS="${KUBE_NAMESPACE:-wri-odp-dev}"
CKAN_POD="${CKAN_POD:-deploy/wri-dev-ckan}"
CKAN_INI="${CKAN_INI:-/srv/app/production.ini}"

kubectl_cmd() {
	kubectl --context "$CTX" -n "$NS" "$@"
}

run_ckan_cmd() {
	local cmd=$1
	local required=${2:-required}

	echo "==> ckan ${cmd}"
	if kubectl_cmd exec "$CKAN_POD" -- ckan -c "$CKAN_INI" ${cmd}; then
		echo "    OK"
		return 0
	fi

	local exit_code=$?
	if [ "$required" = "required" ]; then
		echo "    FAILED (required, exit ${exit_code})"
		exit "$exit_code"
	fi

	echo "    WARN (optional, exit ${exit_code})"
	return 0
}

echo "==> Initializing custom CKAN tables on ${CKAN_POD} (${NS})"

run_ckan_cmd notificationdb
run_ckan_cmd pendingdatasetsdb
run_ckan_cmd downloadeventdb
run_ckan_cmd downloadeventdbupdate optional
run_ckan_cmd resourcelocationdb optional
run_ckan_cmd issuesdb
run_ckan_cmd "db upgrade -p harvest" optional

echo "==> Done"
