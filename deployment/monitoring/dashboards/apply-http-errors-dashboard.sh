#!/usr/bin/env bash
# Apply the WRI HTTP errors Grafana dashboard ConfigMap (picked up by the Grafana sidecar).
#
# Usage:
#   ./deployment/monitoring/dashboards/apply-http-errors-dashboard.sh
#   KUBE_CONTEXT=arn:aws:eks:us-east-1:245948672511:cluster/ckan-prod ./...
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CTX="${KUBE_CONTEXT:-arn:aws:eks:us-east-1:245948672511:cluster/ckan-prod}"
NS="${KUBE_NAMESPACE:-monitoring}"
DASHBOARD_JSON="${SCRIPT_DIR}/wri-http-errors.json"

python3 - "$DASHBOARD_JSON" "$NS" <<'PY' | kubectl --context "$CTX" -n "$NS" apply -f -
import pathlib, sys
path, ns = sys.argv[1], sys.argv[2]
dashboard = pathlib.Path(path).read_text()
indented = "\n".join(("    " + line) if line else line for line in dashboard.splitlines())
print(f"""apiVersion: v1
kind: ConfigMap
metadata:
  name: wri-http-errors-dashboard
  namespace: {ns}
  labels:
    grafana_dashboard: "1"
data:
  wri-http-errors.json: |
{indented}
""")
PY

echo "Applied. Open Grafana → Dashboards → \"WRI ODP — HTTP errors & access logs\""
echo "  https://odp-grafana.wri.org/d/wri-http-errors"
