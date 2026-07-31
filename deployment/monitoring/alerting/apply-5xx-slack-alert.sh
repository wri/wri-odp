#!/usr/bin/env bash
# Create a Grafana alert that fires when nginx ingress logs any HTTP 5xx,
# and routes it to the existing Alertmanager → Slack pipeline.
#
# Usage:
#   ./deployment/monitoring/alerting/apply-5xx-slack-alert.sh
set -euo pipefail

CTX="${KUBE_CONTEXT:-arn:aws:eks:us-east-1:245948672511:cluster/ckan-prod}"
NS="${KUBE_NAMESPACE:-monitoring}"
LOCAL_PORT="${GRAFANA_LOCAL_PORT:-13001}"
FOLDER_UID="wri-odp"
RULE_UID="wri-ingress-http-5xx"
CONTACT_UID="wri-alertmanager"

PASS="$(kubectl --context "$CTX" -n "$NS" get secret prometheus-grafana -o jsonpath='{.data.admin-password}' | base64 -d)"
AUTH="admin:${PASS}"

cleanup() { kill "${PF:-}" 2>/dev/null || true; }
trap cleanup EXIT

kubectl --context "$CTX" -n "$NS" port-forward svc/prometheus-grafana "${LOCAL_PORT}:80" >/tmp/gf-5xx-pf.log 2>&1 &
PF=$!
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -sf -u "$AUTH" "http://127.0.0.1:${LOCAL_PORT}/api/health" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
BASE="http://127.0.0.1:${LOCAL_PORT}"

echo "==> Resolve Loki datasource uid"
LOKI_UID="$(curl -sS -u "$AUTH" "${BASE}/api/datasources" \
  | python3 -c 'import json,sys; ds=json.load(sys.stdin); print(next(d["uid"] for d in ds if d.get("type")=="loki"))')"
echo "    Loki uid=${LOKI_UID}"

echo "==> Create/update folder"
curl -sS -u "$AUTH" -X POST "${BASE}/api/folders" \
  -H 'Content-Type: application/json' \
  -d "{\"uid\":\"${FOLDER_UID}\",\"title\":\"WRI ODP\"}" >/dev/null || true

echo "==> Contact point → Alertmanager"
BODY_CP=$(cat <<EOF
{
  "uid": "${CONTACT_UID}",
  "name": "alertmanager",
  "type": "prometheus-alertmanager",
  "settings": { "url": "http://prometheus-alertmanager:9093" },
  "disableResolveMessage": false
}
EOF
)
CP_OUT="$(curl -sS -u "$AUTH" -X POST "${BASE}/api/v1/provisioning/contact-points" \
  -H 'Content-Type: application/json' -H 'X-Disable-Provenance: true' \
  -d "$BODY_CP" || true)"
if echo "$CP_OUT" | grep -qiE 'already|conflict|exists|unique'; then
  curl -sS -u "$AUTH" -X PUT "${BASE}/api/v1/provisioning/contact-points/${CONTACT_UID}" \
    -H 'Content-Type: application/json' -H 'X-Disable-Provenance: true' \
    -d "$BODY_CP" >/dev/null
elif echo "$CP_OUT" | grep -qiE 'uid|name|message'; then
  echo "    $CP_OUT"
fi

echo "==> Notification policy"
curl -sS -u "$AUTH" -X PUT "${BASE}/api/v1/provisioning/policies" \
  -H 'Content-Type: application/json' -H 'X-Disable-Provenance: true' \
  -d '{
    "receiver": "alertmanager",
    "group_by": ["alertname", "grafana_folder"],
    "group_wait": "10s",
    "group_interval": "2m",
    "repeat_interval": "30m",
    "routes": [
      {
        "receiver": "alertmanager",
        "object_matchers": [["alertname", "=", "IngressHttp5xx"]],
        "group_by": ["alertname", "cluster"],
        "group_wait": "10s",
        "group_interval": "2m",
        "repeat_interval": "30m"
      }
    ]
  }' >/dev/null

echo "==> Alert rule"
curl -sS -u "$AUTH" -X DELETE "${BASE}/api/v1/provisioning/alert-rules/${RULE_UID}" \
  -H 'X-Disable-Provenance: true' >/dev/null 2>&1 || true

export BASE PASS LOKI_UID FOLDER_UID RULE_UID
python3 - <<'PY'
import json, os, urllib.request, base64, urllib.error

base = os.environ["BASE"]
auth = base64.b64encode(f"admin:{os.environ['PASS']}".encode()).decode()
rule = {
  "uid": os.environ["RULE_UID"],
  "title": "Ingress HTTP 5xx detected",
  "ruleGroup": "wri-http-5xx",
  "folderUID": os.environ["FOLDER_UID"],
  "condition": "C",
  "noDataState": "OK",
  "execErrState": "Error",
  "for": "0s",
  "annotations": {
    "summary": "HTTP 5xx detected on ingress",
    "description": "One or more HTTP 5xx responses were logged by nginx-ingress in the last 2 minutes. Dashboard: https://odp-grafana.wri.org/d/wri-http-errors",
    "dashboard_url": "https://odp-grafana.wri.org/d/wri-http-errors",
  },
  "labels": {
    "severity": "warning",
    "alertname": "IngressHttp5xx",
    "cluster": "ckan-prod",
  },
  "data": [
    {
      "refId": "A",
      "relativeTimeRange": {"from": 120, "to": 0},
      "datasourceUid": os.environ["LOKI_UID"],
      "model": {
        "refId": "A",
        "expr": 'sum(count_over_time({namespace="nginx-ingress"} | regexp `"(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) [^"]+" (?P<status>5[0-9]{2}) ` [2m]))',
        "queryType": "instant",
        "instant": True,
        "editorMode": "code",
      },
    },
    {
      "refId": "B",
      "relativeTimeRange": {"from": 120, "to": 0},
      "datasourceUid": "__expr__",
      "model": {
        "refId": "B",
        "type": "reduce",
        "expression": "A",
        "reducer": "last",
        "settings": {"mode": "dropNN"},
      },
    },
    {
      "refId": "C",
      "relativeTimeRange": {"from": 120, "to": 0},
      "datasourceUid": "__expr__",
      "model": {
        "refId": "C",
        "type": "threshold",
        "expression": "B",
        "conditions": [
          {
            "evaluator": {"type": "gt", "params": [0]},
            "operator": {"type": "and"},
            "query": {"params": ["C"]},
            "reducer": {"type": "last", "params": []},
            "type": "query",
          }
        ],
      },
    },
  ],
}
req = urllib.request.Request(
    f"{base}/api/v1/provisioning/alert-rules",
    data=json.dumps(rule).encode(),
    method="POST",
    headers={
        "Content-Type": "application/json",
        "X-Disable-Provenance": "true",
        "Authorization": f"Basic {auth}",
    },
)
try:
    resp = urllib.request.urlopen(req)
    print(resp.read().decode()[:800])
except urllib.error.HTTPError as e:
    print(e.read().decode())
    raise
PY

echo ""
echo "Done. Check Grafana → Alerting → Alert rules → \"Ingress HTTP 5xx detected\""
echo "Slack path: Grafana → Alertmanager → Slack (existing webhook)."
echo "Evaluates ~every 1m on any 5xx in the last 2m (not per-request)."
