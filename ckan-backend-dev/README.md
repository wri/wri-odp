<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [CKAN Backend Development Environment](#ckan-backend-development-environment)
  - [Make Commands](#make-commands)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Build and Run the Environment](#build-and-run-the-environment)
  - [Cypress Integration Tests](#cypress-integration-tests)
    - [Prerequisites](#prerequisites-1)
    - [Run the Integration Tests](#run-the-integration-tests)
  - [Unit Tests](#unit-tests)
    - [Run the Unit Tests](#run-the-unit-tests)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# CKAN Backend Development Environment

A `docker compose` development environment for the CKAN backend.

## Make Commands

Usage: `make <command>`

| Command | Description |
| --- | --- |
| `build` | Build the images |
| `up` | Start the containers |
| `down` | Stop the containers |
| `restart` | Restart the containers |
| `clean` | Stop and remove the containers |
| `search-index-rebuild` | Rebuild the search index |
| `access-db` | Access the DB container |
| `shell` | Access the CKAN container |
| `cypress-config` | Generate the Cypress config file |
| `integration-tests` | Run the integration tests |
| `unit-tests` | Run the unit tests |

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

Copy the included `.env.example` and rename it to `.env`. Modify it depending on your own needs.

Using the default values on the `.env.example` file will get you a working CKAN instance. There is a sysadmin user created by default with the values defined in `CKAN_SYSADMIN_NAME` and `CKAN_SYSADMIN_PASSWORD` (`ckan_admin` and `test1234` by default). This environment is for _development purposes only_. Do not use it in production.

To access the running environment via http://ckan-dev:5000, you must add "ckan-dev" as an alias to your hosts file:

    127.0.0.1 ckan-dev

Otherwise, you will have to change the `.env` entry for `CKAN_SITE_URL`.

**Important**: When you add a new plugin to `CKAN__PLUGINS` in the `.env`, it **must** be added _before_ `envvars`. For more information, see the [envvars README Requirements section](https://github.com/okfn/ckanext-envvars#requirements).

Finally, copy the WRI extension (ckanext-wri) into the `src` directory:

    cp -r ../ckanext-wri src/ckanext-wri

### Build and Run the Environment

Build the images:

	make build

Start the containers:

	make up

Restart the containers:

    make restart

Stop the containers:

    make down

Stop and remove the containers:

    make clean

## Cypress Integration Tests

The integration tests are located in the `wri-odp/integration-tests` directory. They are run using [Cypress](https://www.cypress.io/).

### Prerequisites

**Note:** This has only been tested with `Node v18.17.1` (LTS/Hydrogen). It may work with other versions, but you might run into issues.

- [Node.js](https://nodejs.org/en/download/)

Before running the integration tests, you need to install the dependencies and create a working `cypress.json`.

Install the dependencies:

    cd ../integration-tests
    npm install

Create a working `cypress.json`:

    cp cypress.json.example cypress.json

To generate a new API token:

- Login as `ckan_admin`
- Visit http://ckan-dev:5000/user/ckan_admin/api-tokens
- Enter a name for your new token (this can be anything, e.g. "Cypress")
- Copy the token and update the `API_KEY` field in the `cypress.json` file:

    ```
    "API_KEY": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    ```

**Alternatively**, if you haven't changed the default values in the `.env` file, you can run the following command to generate a new API token, copy the example to `cypress.json`, and update the `API_KEY` field for you:

    make cypress-config

### Run the Integration Tests

Start the containers (if they're not already running):

    make up

Run the integration tests:

    make integration-tests

## Unit Tests

**Note**: The following command assumes that extensions have their unit tests located in `ckanext/<extension_name>/tests`. If a new extension is added and this is not the case, [`run_unit_tests.sh`](ckan-backend-dev/ckan/scripts/run_unit_tests.sh) must be updated to include the alternate path.

### Run the Unit Tests

Start the containers (if they're not already running):

    make up

Enter the CKAN container:

    make unit-tests
