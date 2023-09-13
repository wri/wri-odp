<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [CKAN Backend Development Environment](#ckan-backend-development-environment)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Build and Run the Environment](#build-and-run-the-environment)
    - [Additional Useful Make Commands](#additional-useful-make-commands)
    - [Local S3 Emulation (optional)](#local-s3-emulation-optional)
  - [Cypress Integration Tests](#cypress-integration-tests)
    - [Prerequisites](#prerequisites-1)
    - [Run the Integration Tests](#run-the-integration-tests)
  - [Unit Tests](#unit-tests)
    - [Run the Unit Tests](#run-the-unit-tests)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# CKAN Backend Development Environment

A `docker compose` development environment for the CKAN backend.

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

### Build and Run the Environment

Build the images:

	make build

Start the containers:

	make up

### Additional Useful Make Commands

Stop the containers:

    make down

Stop and remove the containers:

    make clean

Restart the containers:

    make restart

Rebuild the search index:

    make search-index-rebuild

Access the DB container:

    make access-db

Access the CKAN container:

    make shell

### Local S3 Emulation (optional)

You can use [minio](https://min.io/) to run a local S3-like instance for testing purposes (for use with `ckanext-s3filestore`).

Install minio using your package manager or download the binary from the [minio website](https://min.io/download#/linux).

Make a directory to store the data (this can be located wherever you want):

    mkdir -p minio/data

Start minio:

    minio server minio/data

You should now be able to access minio at http://127.0.0.1:9000. You can find all of the information needed in the `minio server` command output.

To configure CKAN to use minio, add the following to your `.env` file (most of the variables below are the default values and should work as expected):

    CKANEXT__S3FILESTORE__AWS_BUCKET_NAME=ckan # Create a bucket in the minio UI and use that name here
    CKANEXT__S3FILESTORE__REGION_NAME=us-east-1 # This is the default region in minio
    CKANEXT__S3FILESTORE__SIGNATURE_VERSION=s3v4 # This is the default signature version in minio
    CKANEXT__S3FILESTORE__AWS_ACCESS_KEY_ID=minioadmin # This is the minio RootUser
    CKANEXT__S3FILESTORE__AWS_SECRET_ACCESS_KEY=minioadmin # This is the minio RootPass
    CKANEXT__S3FILESTORE__HOST_NAME=http://192.168.0.12:9000 # Set this to the first URL listed in the S3-API section of the minio server output

Add `s3filestore` to `CKAN__PLUGINS` in your `.env` file (anywhere before `envvars`):

    CKAN__PLUGINS=... s3filestore envvars

This extension is not enabled by default because CKAN will fail to start if there's no S3 instance available.

## Cypress Integration Tests

The integration tests are located in the `wri-integration-tests` directory. They are run using [Cypress](https://www.cypress.io/).

### Prerequisites

**Note:** This has only been tested with `Node v18.17.1` (LTS/Hydrogen). It may work with other versions, but you might run into issues.

- [Node.js](https://nodejs.org/en/download/)

Before running the integration tests, you need to install the dependencies and create a working `cypress.json`.

Install the dependencies:

    cd wri-integration-tests
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

### Run the Integration Tests

Start the containers (if they're not already running):

    make up

Run the integration tests:

    make integration-tests

## Unit Tests

**Note**: We do not currently have a way to run all of the unit tests at once. You will need to run them per extension.

### Run the Unit Tests

Start the containers (if they're not already running):

    make up

Enter the CKAN container:

    make shell

If running the tests for `ckanext-s3filestore`, you will first need to update a few environment variables in its `test.ini` file to match your local minio server (see [Local S3 Emulation](#local-s3-emulation)):

    cd src/ckanext-s3filestore
    vi test.ini

Update the following variables in `src/ckanext-s3filestore/test.ini`:

    ckanext.s3filestore.aws_access_key_id = test-access-key # e.g. minioadmin
    ckanext.s3filestore.aws_secret_access_key = test-secret-key # e.g. minioadmin
    ckanext.s3filestore.aws_bucket_name = test-bucket # e.g. ckan
    ckanext.s3filestore.host_name = http://127.0.0.1:9000 # e.g. http://192.168.0.12:9000

Run the tests for the extension:

    cd src/<extension-name>
    pytest --ckan-ini=test.ini ckanext/<extension-name>/tests
