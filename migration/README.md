<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Configuration](#configuration)
  - [Prefect Variables/Blocks](#prefect-variablesblocks)
    - [Add a Prefect "Variable"](#add-a-prefect-variable)
    - [Add a Prefect "Secret"](#add-a-prefect-secret)
  - [Environment Variables](#environment-variables)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Configuration

## Prefect Variables/Blocks

The following variables/blocks are required for migrations to work:

| Variable Name | Description | Where to Add |
| --- | --- | --- |
| `ckan_url_dev` | The URL of the backend CKAN instance for the development environment. | "Variables" |
| `ckan_url_staging` | The URL of the backend CKAN instance for the staging environment. | "Variables" |
| `ckan_url_prod` | The URL of the backend CKAN instance for the production environment. | "Variables" |
| `ckan_frontend_url_dev` | The URL of the portal frontend instance for the development environment. | "Variables" |
| `ckan_frontend_url_staging` | The URL of the portal frontend instance for the staging environment. | "Variables" |
| `ckan_frontend_url_prod` | The URL of the portal frontend instance for the production environment. | "Variables" |
| `ckan-api-key-dev` | An admin-level API key for the CKAN instance for the development environment. | "Blocks", type "Secret" |
| `ckan-api-key-staging` | An admin-level API key for the CKAN instance for the staging environment. | "Blocks", type "Secret" |
| `ckan-api-key-prod` | An admin-level API key for the CKAN instance for the production environment. | "Blocks", type "Secret" |

### Add a Prefect "Variable"

1. Go to the Prefect UI
2. Click on "Variables"
3. Click on the "+" button
4. Enter the "Variable Name" and value
5. Click on "Create"

### Add a Prefect "Secret"

1. Go to the Prefect UI
2. Click on "Blocks"
3. Click on the "+" button
4. Search for "Secret"
5. Click on "Add +"
6. Enter the "Variable Name" (called "Block Name" here) and Value
7. Click on "Create"

## Environment Variables

The following environment variables are required for migrations to work:

| Variable Name | Description | Where to Add |
| --- | --- | --- |
| `FLOW_DEPLOYMENT_ENV` | The deployment environment (e.g. "dev", "staging", "prod"). | [wri-odp-secrets](https://github.com/wri/wri-odp-secrets/tree/main/k8s-secrets) - add/update the value to the `wri-ENV-migration-app-envvars.yaml` file (there's one in each environment directory) |
