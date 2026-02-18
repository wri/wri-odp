#!/bin/bash
# Generate monitoring values.yaml from template
#
# Usage: Can be run from anywhere in the filesystem
#   ./deployment/monitoring/monitoring-values.sh
#   /path/to/wri-odp/deployment/monitoring/monitoring-values.sh
#   cd deployment/monitoring && ./monitoring-values.sh
#
# Required environment variables:
#   GRAFANA_ADMIN_PASSWORD  - Admin password for Grafana
#   GRAFANA_DOMAIN          - Domain for Grafana ingress (e.g., grafana.wri.org)
#
# Optional environment variables:
#   SLACK_WEBHOOK_URL       - Slack webhook for alerts (default: empty)
#   SLACK_CHANNEL           - Slack channel for alerts (default: #wri-alerts)
#   ALERT_RECEIVER          - Alert receiver name (default: slack, use 'null' to disable)
#   STORAGE_CLASS           - Kubernetes storage class (default: empty = cluster default)
#   CERT_MANAGER_ISSUER     - Cert-manager issuer name (default: cert-manager)
#   GRAFANA_INGRESS_ENABLED - Enable Grafana ingress (default: true)
#   GRAFANA_STORAGE_SIZE    - Grafana PVC size (default: 10Gi)
#   PROMETHEUS_RETENTION    - Prometheus data retention (default: 15d)
#   PROMETHEUS_RETENTION_SIZE - Prometheus max storage (default: 45GB)
#   PROMETHEUS_STORAGE_SIZE - Prometheus PVC size (default: 50Gi)
#   PROMETHEUS_CPU_REQUEST  - Prometheus CPU request (default: 200m)
#   PROMETHEUS_MEMORY_REQUEST - Prometheus memory request (default: 1Gi)
#   PROMETHEUS_CPU_LIMIT    - Prometheus CPU limit (default: 1000m)
#   PROMETHEUS_MEMORY_LIMIT - Prometheus memory limit (default: 2Gi)
#   ALERTMANAGER_STORAGE_SIZE - Alertmanager PVC size (default: 10Gi)
#   LOKI_STORAGE_SIZE       - Loki PVC size (default: 50Gi)
#   LOKI_RETENTION          - Loki log retention (default: 168h = 7 days)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

# Get script directory and project root (works when called from anywhere)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MONITORING_DIR="$SCRIPT_DIR"

# Files (using absolute paths)
VALUES_TEMPLATE="$MONITORING_DIR/template.yaml"
VALUES_OUTPUT="$MONITORING_DIR/values.yaml"
LOKI_VALUES_OUTPUT="$MONITORING_DIR/loki-values-generated.yaml"

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  WRI ODP Monitoring Values Generator${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Script:       $SCRIPT_DIR/monitoring-values.sh"
echo "Project root: $PROJECT_ROOT"
echo ""

# Validate required environment variables
missing=0

if [ -z "$GRAFANA_ADMIN_PASSWORD" ]; then
    echo -e "${RED}ERROR: GRAFANA_ADMIN_PASSWORD is required${NC}"
    missing=1
fi

if [ -z "$GRAFANA_DOMAIN" ]; then
    echo -e "${RED}ERROR: GRAFANA_DOMAIN is required${NC}"
    missing=1
fi

if [ $missing -eq 1 ]; then
    echo ""
    echo "Usage:"
    echo "  export GRAFANA_ADMIN_PASSWORD='your-secure-password'"
    echo "  export GRAFANA_DOMAIN='grafana.wri.org'"
    echo "  export SLACK_WEBHOOK_URL='https://hooks.slack.com/services/xxx'  # optional"
    echo "  $0"
    exit 1
fi

# Export required variables (already validated above)
export GRAFANA_ADMIN_PASSWORD
export GRAFANA_DOMAIN

# Set and export defaults for optional variables
export STORAGE_CLASS="${STORAGE_CLASS:-}"
export CERT_MANAGER_ISSUER="${CERT_MANAGER_ISSUER:-cert-manager}"
export GRAFANA_INGRESS_ENABLED="${GRAFANA_INGRESS_ENABLED:-true}"
export GRAFANA_STORAGE_SIZE="${GRAFANA_STORAGE_SIZE:-10Gi}"
export PROMETHEUS_RETENTION="${PROMETHEUS_RETENTION:-15d}"
export PROMETHEUS_RETENTION_SIZE="${PROMETHEUS_RETENTION_SIZE:-45GB}"
export PROMETHEUS_STORAGE_SIZE="${PROMETHEUS_STORAGE_SIZE:-50Gi}"
export PROMETHEUS_CPU_REQUEST="${PROMETHEUS_CPU_REQUEST:-200m}"
export PROMETHEUS_MEMORY_REQUEST="${PROMETHEUS_MEMORY_REQUEST:-1Gi}"
export PROMETHEUS_CPU_LIMIT="${PROMETHEUS_CPU_LIMIT:-1000m}"
export PROMETHEUS_MEMORY_LIMIT="${PROMETHEUS_MEMORY_LIMIT:-2Gi}"
export ALERTMANAGER_ENABLED="${ALERTMANAGER_ENABLED:-true}"
export ALERTMANAGER_STORAGE_SIZE="${ALERTMANAGER_STORAGE_SIZE:-10Gi}"
export NODE_EXPORTER_ENABLED="${NODE_EXPORTER_ENABLED:-true}"
export LOKI_STORAGE_SIZE="${LOKI_STORAGE_SIZE:-50Gi}"
export LOKI_RETENTION="${LOKI_RETENTION:-168h}"
export SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
export SLACK_CHANNEL="${SLACK_CHANNEL:-#wri-odp}"
export ALERT_RECEIVER="${ALERT_RECEIVER:-slack}"

# If no Slack webhook, default to null receiver
if [ -z "$SLACK_WEBHOOK_URL" ]; then
    export ALERT_RECEIVER="null"
    echo -e "${YELLOW}Warning: SLACK_WEBHOOK_URL not set, alerts will use 'null' receiver${NC}"
fi

echo "Configuration:"
echo "  Grafana Domain:     $GRAFANA_DOMAIN"
echo "  Grafana Ingress:    $GRAFANA_INGRESS_ENABLED"
echo "  Storage Class:      ${STORAGE_CLASS:-<cluster default>}"
echo "  Prometheus Storage: $PROMETHEUS_STORAGE_SIZE"
echo "  Prometheus Retention: $PROMETHEUS_RETENTION"
echo "  Loki Storage:       $LOKI_STORAGE_SIZE"
echo "  Loki Retention:     $LOKI_RETENTION"
echo "  Alert Receiver:     $ALERT_RECEIVER"
echo ""

# Generate combined values.yaml using envsubst-style replacement
# This is a simple templater that replaces {{VAR}} with the value of $VAR
echo -e "${YELLOW}Generating values.yaml...${NC}"

# Create a sed script to replace all {{VAR}} patterns
# This works on both macOS and Linux
sed_script=""
for var in GRAFANA_ADMIN_PASSWORD GRAFANA_DOMAIN STORAGE_CLASS CERT_MANAGER_ISSUER \
           GRAFANA_INGRESS_ENABLED GRAFANA_STORAGE_SIZE PROMETHEUS_RETENTION \
           PROMETHEUS_RETENTION_SIZE PROMETHEUS_STORAGE_SIZE PROMETHEUS_CPU_REQUEST \
           PROMETHEUS_MEMORY_REQUEST PROMETHEUS_CPU_LIMIT PROMETHEUS_MEMORY_LIMIT \
           ALERTMANAGER_ENABLED ALERTMANAGER_STORAGE_SIZE NODE_EXPORTER_ENABLED \
           LOKI_STORAGE_SIZE LOKI_RETENTION \
           SLACK_WEBHOOK_URL SLACK_CHANNEL ALERT_RECEIVER; do
    value="${!var}"
    # Escape special characters for sed
    escaped_value=$(printf '%s\n' "$value" | sed 's/[&/\]/\\&/g')
    sed_script="${sed_script}s|{{${var}}}|${escaped_value}|g;"
done

sed "$sed_script" "$VALUES_TEMPLATE" > "$VALUES_OUTPUT"

# Extract loki-stack section to separate file for the second helm install
echo -e "${YELLOW}Extracting loki-stack values...${NC}"
# Use awk to extract the loki-stack section
awk '/^loki-stack:$/,0 { if (/^loki-stack:$/) next; if (/^[a-zA-Z]/ && !/^  /) exit; print }' "$VALUES_OUTPUT" | sed 's/^  //' > "$LOKI_VALUES_OUTPUT"

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  Values files generated!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Generated files:"
echo "  Prometheus stack: $VALUES_OUTPUT"
echo "  Loki stack:       $LOKI_VALUES_OUTPUT"
echo ""
echo -e "${YELLOW}Note: values.yaml and loki-values-generated.yaml are gitignored${NC}"
echo ""
echo "To deploy the monitoring stack:"
echo ""
echo "  # 1. Create namespace"
echo "  kubectl create namespace monitoring"
echo ""
echo "  # 2. Install kube-prometheus-stack (Prometheus + Grafana)"
echo "  helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \\"
echo "    -n monitoring \\"
echo "    -f $VALUES_OUTPUT \\"
echo "    --create-namespace \\"
echo "    --wait --timeout 10m"
echo ""
echo "  # 3. Install Loki stack (Loki + Promtail)"
echo "  helm upgrade --install loki grafana/loki-stack \\"
echo "    -n monitoring \\"
echo "    -f $LOKI_VALUES_OUTPUT \\"
echo "    --create-namespace \\"
echo "    --wait --timeout 5m"
echo ""
