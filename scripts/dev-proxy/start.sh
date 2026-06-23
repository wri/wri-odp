#!/usr/bin/env bash
set -euo pipefail

HOST="datasets-dev.wri.org"
PORT_FORWARD_URL="http://127.0.0.1:3000/"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! command -v caddy >/dev/null 2>&1; then
	echo "Caddy is not installed. Run: brew install caddy"
	exit 1
fi

if ! curl -sf -o /dev/null "$PORT_FORWARD_URL"; then
	echo "Port-forward is not running. Start it in another terminal:"
	echo ""
	echo "  kubectl --context arn:aws:eks:us-east-1:245948672511:cluster/ckan-prod \\"
	echo "    -n wri-odp-dev port-forward svc/wri-dev-frontend-svc 3000:80"
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

echo "Port-forward: OK"
echo "Hosts entry:  OK"
echo ""
echo "Open: https://${HOST}/"
echo ""
echo "First visit: accept the local TLS cert, or run once: caddy trust"
echo "Press Ctrl+C to stop the proxy."
echo ""

exec caddy run --config "$SCRIPT_DIR/Caddyfile"
