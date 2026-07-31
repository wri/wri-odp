# Monitoring Stack

This directory contains the configuration for the WRI ODP monitoring stack:
- **Prometheus** - Metrics collection and alerting
- **Grafana** - Visualization and dashboards
- **Loki** - Log aggregation
- **Promtail** - Log collection agent

## Architecture

The monitoring stack is deployed in a dedicated `monitoring` namespace and collects metrics/logs from all application namespaces:
- `wri-odp-dev`
- `wri-odp-staging`
- `wri-odp-prod`

## Prerequisites

1. Kubernetes cluster with nginx-ingress controller
2. cert-manager for TLS certificates
3. Helm 3.x installed
4. kubectl configured with cluster access

## Configuration

### Environment Variables

**Required:**
| Variable | Description |
|----------|-------------|
| `GRAFANA_ADMIN_PASSWORD` | Admin password for Grafana |
| `GRAFANA_DOMAIN` | Domain for Grafana ingress (e.g., `grafana.wri.org`) |

**Optional:**
| Variable | Default | Description |
|----------|---------|-------------|
| `SLACK_WEBHOOK_URL` | (empty) | Slack webhook for alerts |
| `SLACK_CHANNEL` | `#wri-alerts` | Slack channel for alerts |
| `CLUSTER_NAME` | `unknown` | Cluster label on metrics/alerts (e.g. `ckan-dev`, `ckan-prod`) |
| `ALERT_RECEIVER` | `slack` | Alert receiver (`slack` or `null`) |
| `STORAGE_CLASS` | (cluster default) | Kubernetes storage class |
| `CERT_MANAGER_ISSUER` | `cert-manager` | Cert-manager issuer name |
| `GRAFANA_INGRESS_ENABLED` | `true` | Enable Grafana ingress |
| `GRAFANA_STORAGE_SIZE` | `10Gi` | Grafana PVC size |
| `PROMETHEUS_RETENTION` | `15d` | Prometheus data retention |
| `PROMETHEUS_RETENTION_SIZE` | `45GB` | Prometheus max storage |
| `PROMETHEUS_STORAGE_SIZE` | `50Gi` | Prometheus PVC size |
| `ALERTMANAGER_STORAGE_SIZE` | `10Gi` | Alertmanager PVC size |
| `LOKI_STORAGE_SIZE` | `50Gi` | Loki PVC size |
| `LOKI_RETENTION` | `168h` | Loki log retention (7 days) |

### Files

| File | Description |
|------|-------------|
| `template.yaml` | Template with `{{VAR}}` placeholders (committed) |
| `monitoring-values.sh` | Script to generate values files (committed) |
| `values.yaml` | Generated Prometheus stack values (gitignored) |
| `loki-values-generated.yaml` | Generated Loki stack values (gitignored) |
| `README.md` | This documentation |

## Manual Installation

### 1. Add Helm repositories

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

### 2. Generate values files

```bash
export GRAFANA_ADMIN_PASSWORD='your-secure-password'
export GRAFANA_DOMAIN='grafana.wri.org'
export CLUSTER_NAME='ckan-prod'   # or ckan-dev — appears on all Slack alerts
./monitoring-values.sh
```

### 3. Create namespace

```bash
kubectl create namespace monitoring
```

### 4. Install kube-prometheus-stack

```bash
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring \
  -f values.yaml \
  --wait --timeout 10m
```

### 5. Install Loki stack

```bash
helm upgrade --install loki grafana/loki-stack \
  -n monitoring \
  -f loki-values-generated.yaml \
  --wait --timeout 5m
```

## Accessing Grafana

### Via Ingress (if configured)

Access at: `https://<GRAFANA_DOMAIN>`

Default credentials:
- Username: `admin`
- Password: Value of `GRAFANA_ADMIN_PASSWORD`

### Via Port Forward

```bash
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
# Access at http://localhost:3000
```

## Accessing Prometheus

```bash
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090
# Access at http://localhost:9090
```

## Useful Grafana Queries

### Prometheus (Metrics)

```promql
# CPU usage by namespace
sum by (namespace) (rate(container_cpu_usage_seconds_total{namespace=~"wri-odp-.*"}[5m]))

# Memory usage by namespace
sum by (namespace) (container_memory_usage_bytes{namespace=~"wri-odp-.*"})

# HTTP request rate for CKAN
sum(rate(nginx_ingress_controller_requests{namespace=~"wri-odp-.*"}[5m])) by (namespace)

# Pod restart count
sum by (namespace, pod) (kube_pod_container_status_restarts_total{namespace=~"wri-odp-.*"})
```

### Loki (Logs)

```logql
# All errors from production
{namespace="wri-odp-prod"} |= "error"

# CKAN logs from staging
{namespace="wri-odp-staging", container="ckan"}

# Frontend logs with specific error
{namespace="wri-odp-prod", container="frontend"} |~ "(?i)error|exception"

# Slow requests (if logged)
{namespace="wri-odp-prod"} | json | duration > 5s
```

## WRI HTTP errors dashboard

Raw Explore log lines from nginx are hard to scan. Use the dedicated dashboard that:

- Charts **2xx/3xx/4xx/5xx** rates and exact **4xx/5xx status code counts**
- Parses access logs into `status method path upstream latency UA`
- Filters by status / path / upstream
- Shows matching frontend/CKAN app error logs

Files:

- `dashboards/wri-http-errors.json` — dashboard definition
- `dashboards/apply-http-errors-dashboard.sh` — apply as a ConfigMap (Grafana sidecar)

```bash
./deployment/monitoring/dashboards/apply-http-errors-dashboard.sh
```

Open: https://odp-grafana.wri.org/d/wri-http-errors

**Note:** nginx Ingress Prometheus metrics are not scraped today (no ServiceMonitor). This dashboard uses Loki-parsed access logs instead.

## Alerting

Alertmanager is included in the stack. Alerts are pre-configured in the template for:
- High memory usage (>85% of limit)
- Pod crash looping
- High error rate (>5% 5xx responses) — requires nginx Prometheus metrics (not currently scraped)
- Pod not ready for >10 minutes (excludes completed Job/CronJob pods in `Succeeded` phase)
- **Ingress HTTP 5xx** — Grafana + Loki access-log alert → Alertmanager → Slack (any 5xx in last 2m)

### Slack alert on every 5xx window

Nginx on this cluster does **not** expose `nginx_ingress_controller_requests` (only Go runtime metrics), so 5xx Slack alerts are based on **Loki access logs** instead.

Apply live (Grafana API):

```bash
./deployment/monitoring/alerting/apply-5xx-slack-alert.sh
```

Or bake into the monitoring Helm values (after `./monitoring-values.sh`) and `helm upgrade` the prometheus stack — see `grafana.alerting` in `template.yaml`.

**Noise warning:** this fires when *any* 5xx appears in a 2‑minute window (bots, bad `map=` URLs, `&` search, etc.), not once per request. Evaluation is ~1m; Slack repeat for this alert is 30m.

Slack notifications include a **cluster** label (from `CLUSTER_NAME`) so alerts from `ckan-dev` and `ckan-prod` are distinguishable.

To configure Slack notifications, set `SLACK_WEBHOOK_URL` before running the script.

Apply to each cluster separately with the matching `CLUSTER_NAME`, then run `helm upgrade` on that cluster's monitoring stack.

## Upgrading

When upgrading the chart across major operator versions (e.g. v0.88 → v0.91), apply CRDs **before** `helm upgrade`:

```bash
helm show crds prometheus-community/kube-prometheus-stack | kubectl apply --server-side --force-conflicts -f -
```

If Helm fails with a ConfigMap conflict (`conflict with "kubectl-patch"`), delete the affected ConfigMap and retry — Helm recreates it:

```bash
# Prometheus stack
kubectl -n monitoring delete configmap prometheus-grafana-datasource

# Loki stack
kubectl -n monitoring delete configmap loki-loki-stack
```

Regenerate values if needed, then upgrade both stacks:

```bash
./monitoring-values.sh

helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  -n monitoring \
  -f values.yaml \
  --create-namespace \
  --wait --timeout 10m

helm upgrade --install loki grafana/loki-stack \
  -n monitoring \
  -f loki-values-generated.yaml \
  --create-namespace \
  --wait --timeout 5m
```

## Uninstalling

```bash
helm uninstall prometheus -n monitoring
helm uninstall loki -n monitoring
kubectl delete namespace monitoring
```
