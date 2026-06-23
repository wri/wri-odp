#!/usr/bin/env bash
# Seed minimal CKAN data on a cluster namespace for smoke testing (empty/fresh DB).
# Requires: kubectl access, ckan_admin user on the target CKAN pod.
#
# Dev (default):
#   ./scripts/seed-dev-smoke-data.sh
#
# Staging:
#   KUBE_NAMESPACE=wri-odp-staging CKAN_POD=deploy/wri-staging-ckan ./scripts/seed-dev-smoke-data.sh
set -euo pipefail

CTX="${KUBE_CONTEXT:-arn:aws:eks:us-east-1:245948672511:cluster/ckan-prod}"
NS="${KUBE_NAMESPACE:-wri-odp-dev}"
CKAN_POD="${CKAN_POD:-deploy/wri-dev-ckan}"
CKAN_ADMIN="${CKAN_ADMIN:-ckan_admin}"
API="http://127.0.0.1:5000/api/3/action"

kubectl_cmd() {
	kubectl --context "$CTX" -n "$NS" "$@"
}

ckan_api() {
	local action="$1"
	local body="$2"
	kubectl_cmd exec "$CKAN_POD" -- curl -sf -X POST "$API/$action" \
		-H "Content-Type: application/json" \
		-H "Authorization: $API_TOKEN" \
		-d "$body"
}

echo "==> Getting API token for $CKAN_ADMIN"
API_TOKEN="$(kubectl_cmd exec "$CKAN_POD" -- ckan -c /srv/app/production.ini user token add "$CKAN_ADMIN" dev-smoke-seed-$RANDOM 2>&1 | awk 'NF {print $NF}' | tail -1 | tr -d '[:space:]')"

if [[ -z "$API_TOKEN" ]]; then
	echo "Failed to create API token for $CKAN_ADMIN"
	exit 1
fi

echo "==> Current counts"
kubectl_cmd exec "$CKAN_POD" -- curl -sf "$API/group_list" -H "Authorization: $API_TOKEN" || true
kubectl_cmd exec "$CKAN_POD" -- curl -sf "$API/organization_list" -H "Authorization: $API_TOKEN" || true

create_if_missing() {
	local action="$1"
	local name="$2"
	local body="$3"
	if ckan_api "$action" "$body" 2>/dev/null | grep -q '"success": true'; then
		echo "  created: $name"
	elif ckan_api "$action" "$body" 2>&1 | grep -q 'already exists'; then
		echo "  exists:  $name"
	else
		echo "  failed:  $name"
		ckan_api "$action" "$body" || true
	fi
}

echo "==> Seeding organization (team)"
create_if_missing organization_create data-lab \
	'{"name":"data-lab","title":"WRI Data Lab","description":"Sample team for dev smoke testing","visibility":"public"}'

echo "==> Seeding topic (group)"
create_if_missing group_create forests \
	'{"name":"forests","title":"Forests","description":"Sample topic for dev smoke testing","type":"group"}'

echo "==> Seeding application"
create_if_missing group_create sample-app \
	'{"name":"sample-app","title":"Sample Application","description":"Sample application","type":"application","homepage_url":"http://example.com","help_url":"http://example.com/help","contact_url":"http://example.com/contact"}'

echo "==> Rebuilding search index"
kubectl_cmd exec "$CKAN_POD" -- ckan -c /srv/app/production.ini search-index rebuild

echo "==> Done. Final counts:"
echo -n "  topics: "
kubectl_cmd exec "$CKAN_POD" -- curl -sf "$API/group_list" -H "Authorization: $API_TOKEN"
echo -n "  teams:  "
kubectl_cmd exec "$CKAN_POD" -- curl -sf "$API/organization_list" -H "Authorization: $API_TOKEN"
echo -n "  apps:   "
kubectl_cmd exec "$CKAN_POD" -- curl -sf "$API/group_list?type=application" -H "Authorization: $API_TOKEN"
