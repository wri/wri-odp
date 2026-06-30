<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents** 

- [WRI ODP](#wri-odp)
  - [CKAN Backend Development](#ckan-backend-development)
  - [CKAN Deployment](#ckan-deployment)
  - [Updating READMEs](#updating-readmes)
  - [Running the App Locally](#running-the-app-locally)
    - [Prerequisites](#prerequisites)
    - [1. Copy environment files](#1-copy-environment-files)
    - [2. Build and start the Docker stack](#2-build-and-start-the-docker-stack)
    - [3. Initialise the database](#3-initialise-the-database)
    - [4. Create the `issue` / `issue_comment` tables](#4-create-the-issue--issue_comment-tables)
    - [5. Create the sysadmin user and generate an API token](#5-create-the-sysadmin-user-and-generate-an-api-token)
    - [6. Register the CKAN API token in Prefect](#6-register-the-ckan-api-token-in-prefect)
    - [7. Configure the frontend `.env`](#7-configure-the-frontend-env)
    - [8. Start the frontend](#8-start-the-frontend)
    - [Service URLs](#service-urls)
    - [Seed test data](#seed-test-data)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# WRI ODP 

The WRI Open Data Portal monorepo

## CKAN Backend Development

See the [CKAN Backend Development README](ckan-backend-dev/README.md) for instructions on how to set up a local Docker CKAN backend development environment. Note: the `ckanext-wri` extension in the root of this repo is a symlink to `ckanext-wri` in `ckan-backend-dev/src`. See the README above and the [WRI Extension README](ckan-backend-dev/src/ckanext-wri/README.md) for more information.

## CKAN Deployment

See the [CKAN Deployment README](ckan-deployment/README.md) for instructions on how to deploy CKAN to EKS.

## Updating READMEs

The table of contents in the READMEs are generated using generated using [DocToc](https://github.com/thlorenz/doctoc). You can install it globally by running:

    npm install -g doctoc

Then, to update the table of contents in a markdown file, for example, `README.md`, run:

    doctoc README.md

## Running the App Locally

### Prerequisites

- Docker Desktop running
- Node.js 18+ installed
- Ports 3000, 4200, 5000, 5432, 8983, 9000, 39323 free

---

### 1. Copy environment files

```bash
cp ckan-backend-dev/.env.example ckan-backend-dev/.env
cp deployment/frontend/.env.example deployment/frontend/.env
```

Edit `ckan-backend-dev/.env` and confirm these values are set (not interpolated variables):

```env
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
CKANEXT__S3FILESTORE__AWS_ACCESS_KEY_ID=minioadmin
CKANEXT__S3FILESTORE__AWS_SECRET_ACCESS_KEY=minioadmin
CKANEXT__S3FILESTORE__AWS_BUCKET_NAME=ckan
CKANEXT__S3FILESTORE__HOST_NAME=http://minio:9000
```

---

### 2. Build and start the Docker stack

```bash
cd ckan-backend-dev
docker compose -f docker-compose.dev.yml up -d --build
```

Wait until all containers are healthy (~2 min):

```bash
docker compose -f docker-compose.dev.yml ps
```

---

### 3. Initialise the database

Due to a CKAN 2.11 bug, `config.get('ckan.plugins')` returns a raw string that the plugin-migration loop iterates character-by-character, causing `Plugin 'i' cannot be loaded`. Use `--skip-plugins` for the core migration, then run each extension migration individually with `-p`:

```bash
# Core CKAN schema
docker exec -it ckan-wri ckan -c /srv/app/production.ini db upgrade --skip-plugins

# Extension-specific migrations (activity adds permission_labels; harvest creates harvest_object etc.)
docker exec -it ckan-wri ckan -c /srv/app/production.ini db upgrade -p activity
docker exec -it ckan-wri ckan -c /srv/app/production.ini db upgrade -p harvest
```

---

### 4. Create the `issue` / `issue_comment` tables

`ckanext-issues` uses SQLAlchemy `create_all()` instead of Alembic, so its tables are not covered by `db upgrade`. Create them directly:

```bash
docker exec db-wri psql -U postgres -d ckandb -c "
CREATE TABLE IF NOT EXISTS issue_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS issue (
    id SERIAL PRIMARY KEY,
    number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    dataset_id TEXT NOT NULL,
    resource_id TEXT,
    user_id TEXT NOT NULL,
    assignee_id TEXT,
    status VARCHAR(15) NOT NULL DEFAULT 'open',
    resolved TIMESTAMP,
    created TIMESTAMP NOT NULL DEFAULT NOW(),
    visibility TEXT DEFAULT 'visible',
    abuse_status INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_issue_number_dataset_id ON issue (dataset_id, number);
CREATE TABLE IF NOT EXISTS issue_comment (
    id SERIAL PRIMARY KEY,
    comment TEXT NOT NULL,
    user_id TEXT NOT NULL,
    issue_id INTEGER NOT NULL REFERENCES issue(id) ON UPDATE CASCADE ON DELETE CASCADE,
    created TIMESTAMP NOT NULL DEFAULT NOW(),
    visibility TEXT DEFAULT 'visible',
    abuse_status INTEGER DEFAULT 0
);
GRANT ALL PRIVILEGES ON TABLE issue_category TO ckandbuser;
GRANT ALL PRIVILEGES ON TABLE issue TO ckandbuser;
GRANT ALL PRIVILEGES ON TABLE issue_comment TO ckandbuser;
GRANT ALL PRIVILEGES ON SEQUENCE issue_category_id_seq TO ckandbuser;
GRANT ALL PRIVILEGES ON SEQUENCE issue_id_seq TO ckandbuser;
GRANT ALL PRIVILEGES ON SEQUENCE issue_comment_id_seq TO ckandbuser;
"
```

---

### 5. Create the sysadmin user and generate an API token

```bash
# Create admin user
docker exec -it ckan-wri ckan -c /srv/app/production.ini user add ckan_admin \
  email=admin@example.com password=password123

# Promote to sysadmin
docker exec -it ckan-wri ckan -c /srv/app/production.ini sysadmin add ckan_admin

# Generate API token — copy the output
docker exec -it ckan-wri ckan -c /srv/app/production.ini user token add ckan_admin local-dev-token
```

The `ckan_admin` sysadmin is also used by the CKAN backend to dynamically generate short-lived API tokens that are passed to Prefect flows so they can authenticate callbacks to CKAN.

---

### 6. Register the CKAN API token in Prefect

The migration app reads the CKAN API key from a Prefect **Secret block** named `ckan-api-key-dev` at startup.

Open the Prefect UI at **http://localhost:4200** and create it:

1. Go to **Blocks → + Add Block**
2. Choose **Secret**
3. Set the block name to `ckan-api-key-dev`
4. Set the value to the token generated in step 6
5. Click **Create**

Or create it via the CLI (run from the `.venv` with `prefect` installed, or directly if `prefect` is on your PATH):

```bash
PREFECT_API_URL=http://localhost:4200/api prefect block create secret \
  --name ckan-api-key-dev \
  --value <your-token>
```

---

### 7. Configure the frontend `.env`

Edit `deployment/frontend/.env` with the following values:

```env
CKAN_URL="http://localhost:5000"
NEXT_PUBLIC_CKAN_URL="http://localhost:5000"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_NEXTAUTH_URL="http://localhost:3000"
PREFECT_INTERNAL_URL="http://127.0.0.1:4200"
S3_ACCESS_KEY_ID="minioadmin"
S3_SECRET_KEY_ID="minioadmin"
S3_BUCKET_NAME="ckan"
S3_BUCKET_REGION="us-east-1"
S3_ENDPOINT="http://localhost:9000"

# Token from step 6
SYS_ADMIN_API_KEY="<token>"
```

---

### 8. Start the frontend

```bash
cd deployment/frontend
npm install
npm run dev
```

App is now available at **http://localhost:3000**.

---

### Service URLs

| Service        | URL                     |
|----------------|-------------------------|
| Frontend       | http://localhost:3000   |
| CKAN           | http://localhost:5000   |
| Prefect UI     | http://localhost:4200   |
| Minio console  | http://localhost:39323  |
| Solr admin     | http://localhost:8983   |
| MailHog        | http://localhost:8025   |

---

### Seed test data

After completing steps 1–7 above, set up a Python virtual environment and run the seed script:

```bash
cd ckan-backend-dev

# Create and activate the virtual environment
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements-dev.txt

# Run the seed script
python seed.py --api-key <ckan-api-token>

# Deactivate when done
deactivate
```

The script creates:
- Organization: `wri-test-team`
- Dataset: `test-bulk-download` (approved, public)
- Two CSV resources uploaded to local Minio

You can then visit `http://localhost:3000` and use the `test-bulk-download` dataset to test the bulk download flow end-to-end.

Re-running the script is safe — it skips anything that already exists.
Lets run
