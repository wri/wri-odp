# prefect-server

This repo uses helm chart for prefect server

For complete documentation refer to prefect homepage  
**Homepage:** <https://github.com/PrefectHQ>

The `values.yaml` is edited and setup according to our cluster.

## Installing the Chart

To install the chart with the release name `helm-prefect-release`:

```console
helm repo add prefect https://prefecthq.github.io/prefect-helm
helm pull prefect/prefect-server --untar

```
Make the changes that are required in `values.yaml` or any other file and apply the changes

```console
helm upgrade helm-prefect-release . -n prefect-server --values=values.yaml
```


