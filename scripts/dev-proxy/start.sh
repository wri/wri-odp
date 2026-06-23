#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
KUBE_CONTEXT="arn:aws:eks:us-east-1:245948672511:cluster/ckan-prod"
PORT_FORWARD_URL="http://127.0.0.1:3000/"

usage() {
	echo "Usage: $0 [dev|staging|prod]"
	echo ""
	echo "  dev      datasets-dev.wri.org (default)"
	echo "  staging  datasets-staging.wri.org"
	echo "  prod     datasets.wri.org"
	exit 1
}

ENV="${1:-dev}"

case "$ENV" in
dev)
	HOST="datasets-dev.wri.org"
	NAMESPACE="wri-odp-dev"
	SERVICE="wri-dev-frontend-svc"
	;;
staging)
	HOST="datasets-staging.wri.org"
	NAMESPACE="wri-odp-staging"
	SERVICE="wri-staging-frontend-svc"
	;;
prod)
	HOST="datasets.wri.org"
	NAMESPACE="wri-odp-prod"
	SERVICE="wri-prod-frontend-svc"
	;;
*)
	usage
	;;
esac

if ! command -v caddy >/dev/null 2>&1; then
	echo "Caddy is not installed. Run: brew install caddy"
	exit 1
fi

if ! curl -sf -o /dev/null "$PORT_FORWARD_URL"; then
	echo "Port-forward is not running. Start it in another terminal:"
	echo ""
	echo "  kubectl --context $KUBE_CONTEXT \\"
	echo "    -n $NAMESPACE port-forward svc/$SERVICE 3000:80"
	echo ""
	exit 1
fi

if ! grep -q "$HOST" /etc/hosts; then
	echo "Add this line to /etc/hosts (requires sudo):"
	echo ""
	echo "  127.0.0.1 $HOST"
	echo ""
	echo "Run:"
	echo "  echo '127.0.0.1 $HOST' | sudo tee -a /etc/hosts"
	echo ""
	exit 1
fi

echo "Environment:  $ENV"
echo "Port-forward: OK"
echo "Hosts entry:  OK"
echo ""
echo "Open: https://${HOST}/"
echo ""
echo "First visit: accept the local TLS cert, or run once: caddy trust"
echo "Press Ctrl+C to stop the proxy."
echo ""

export DEV_PROXY_HOST="$HOST"
exec caddy run --config "$SCRIPT_DIR/Caddyfile"
