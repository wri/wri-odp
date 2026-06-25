#!/usr/bin/env bash
# Generate a fresh CKAN API token for ckan_admin and update the frontend secret.
#
# Dev:
#   ./scripts/rotate-sys-admin-api-key.sh
#
# Staging:
#   KUBE_NAMESPACE=wri-odp-staging \
#   CKAN_POD=deploy/wri-staging-ckan \
#   FRONTEND_DEPLOY=deploy/wri-staging-frontend \
#   FRONTEND_SECRET=wri-staging-frontend-envvars \
#   ./scripts/rotate-sys-admin-api-key.sh
set -euo pipefail

CTX="${KUBE_CONTEXT:-arn:aws:eks:us-east-1:245948672511:cluster/ckan-prod}"
NS="${KUBE_NAMESPACE:-wri-odp-dev}"
CKAN_POD="${CKAN_POD:-deploy/wri-dev-ckan}"
FRONTEND_DEPLOY="${FRONTEND_DEPLOY:-deploy/wri-dev-frontend}"
FRONTEND_SECRET="${FRONTEND_SECRET:-wri-dev-frontend-envvars}"
CKAN_ADMIN="${CKAN_ADMIN:-ckan_admin}"
TOKEN_NAME="${TOKEN_NAME:-frontend-sysadmin}"
CKAN_INI="${CKAN_INI:-/srv/app/production.ini}"

kubectl_cmd() {
	kubectl --context "$CTX" -n "$NS" "$@"
}

echo "==> Generating token on ${CKAN_POD} (${NS})"
NEW_TOKEN="$(kubectl_cmd exec "$CKAN_POD" -- ckan -c "$CKAN_INI" user token add "$CKAN_ADMIN" "${TOKEN_NAME}-$(date +%s)" 2>&1 | awk 'NF {print $NF}' | tail -1 | tr -d '[:space:]')"

if [[ -z "$NEW_TOKEN" ]]; then
	echo "Failed to generate API token for ${CKAN_ADMIN}"
	exit 1
fi

echo "==> Verifying token against CKAN"
kubectl_cmd exec "$CKAN_POD" -- curl -sf "http://127.0.0.1:5000/api/3/action/user_list" \
	-H "Authorization: ${NEW_TOKEN}" >/dev/null

B64="$(python3 -c "import base64, sys; print(base64.b64encode(sys.argv[1].encode()).decode())" "$NEW_TOKEN")"

echo "==> Patching secret ${FRONTEND_SECRET}"
kubectl_cmd patch secret "$FRONTEND_SECRET" --type merge \
	-p "{\"data\":{\"SYS_ADMIN_API_KEY\":\"${B64}\"}}"

echo "==> Restarting ${FRONTEND_DEPLOY}"
kubectl_cmd rollout restart "$FRONTEND_DEPLOY"
kubectl_cmd rollout status "$FRONTEND_DEPLOY" --timeout=300s

echo "==> Done"
echo "Token name prefix: ${TOKEN_NAME}"
echo "Store this token in wri-odp-secrets (${NS}) so the next deploy does not revert it."
echo ""
echo "Verify from a CKAN port-forward:"
echo "  export SYS_ADMIN_API_KEY='${NEW_TOKEN}'"
echo "  curl -s http://localhost:5000/api/3/action/user_list -H \"Authorization: \$SYS_ADMIN_API_KEY\" | jq '{success, users: (.result | length)}'"
