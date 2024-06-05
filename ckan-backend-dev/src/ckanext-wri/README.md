<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [ckanext-wri](#ckanext-wri)
  - [Notifications Feature](#notifications-feature)
    - [Database Setup](#database-setup)
    - [API Endpoints](#api-endpoints)
      - [POST /api/action/notification_create](#post-apiactionnotification_create)
      - [POST /api/action/notification_update](#post-apiactionnotification_update)
      - [GET /api/action/notification_get_all](#get-apiactionnotification_get_all)
  - [Pending Datasets (Approval Workflow)](#pending-datasets-approval-workflow)
    - [Pending Dataset Table](#pending-dataset-table)
      - [Initializing the Pending Dataset Table](#initializing-the-pending-dataset-table)
    - [API Endpoints](#api-endpoints-1)
      - [POST /api/action/pending_dataset_create](#post-apiactionpending_dataset_create)
      - [POST /api/action/pending_dataset_update](#post-apiactionpending_dataset_update)
      - [POST /api/action/pending_dataset_delete](#post-apiactionpending_dataset_delete)
      - [GET /api/action/pending_dataset_show](#get-apiactionpending_dataset_show)
      - [GET /api/action/pending_diff_show](#get-apiactionpending_diff_show)
  - [API Analytics Tracking](#api-analytics-tracking)
  - [Development](#development)
  - [Testing](#testing)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# ckanext-wri

This is the WRI Open Data Portal extension for CKAN. It contains CKAN backend customizations for this project.

## Notifications Feature

This extension includes a notification feature that utilizes its own database, action endpoints, and custom validators.
The feature adds three actions
* `notification_create`
* `notification_update`
* `notification_get_all`

### Database Setup

This extension adds a table named `notifications` to the database for the API notification feature. Initialization is required on the initial boot-up of the extension.

To initiate the database setup, use the following command:

```console
ckan -c <path-to-ini-file> notificationdb
```

### API Endpoints

#### POST /api/action/notification_create

**Parameters:**
- **recipient_id** (string) – The user ID of the recipient of the notification (required).
- **sender_id** (string) – The user ID of the sender of the notification (required).
- **activity_type** (string) – The type of activity that triggers the notification, such as `dataset_create`, etc. (required).
- **object_type** (string) – The type of the object on which the action is being performed (e.g., dataset, resource, etc.) (required).
- **object_id** (string) – The ID of the object on which the action is being performed (required).

The parameters `time_sent` (set to the current timestamp), `state` (set as `active`) and `is_unread` (set to `false`) are automatically configured during creation.

#### POST /api/action/notification_update

**Parameters:**
- **recipient_id** (string) – The user ID of the recipient of the notification (required).
- **sender_id** (string) – The user ID of the sender of the notification (required).
- **activity_type** (string) – The type of activity that triggers the notification, such as `dataset_create`, etc. (required).
- **object_type** (string) – The type of the object on which the action is being performed (e.g., dataset, resource, etc.) (required).
- **object_id** (string) – The ID of the object on which the action is being performed (required).
- **time_sent** (datetime withut timezone) – The timestamp of the sent time (required).
- **is_unread** (string) – Indicates whether the notification is read or not (required).
- **state** (string) – `active` or `deleted` (required).

#### GET /api/action/notification_get_all

Returns a list of notifications for a sender or recipient.

**Parameters:**
- **recipient_id** (string) – The user ID of the recipient of the notification (optional, but either `recipient_id` or `sender_id` is required).
- **sender_id** (string) – The user ID of the sender of the notification (optional, but either `recipient_id` or `sender_id` is required).

## Pending Datasets (Approval Workflow)

A pending dataset is dataset metadata that's been submitted for approval. While pending, the dataset metadata lives in a separate table from the main `package` table, `pending_datasets`. Once approved, the existing dataset is updated with the new metadata.

### Pending Dataset Table

The `pending_datasets` table has the following columns:

| `package_id` | `package_data` | `last_modified` |
| ------------ | -------------- | --------------- |
| `text` (PK)  | `jsonb`        | `timestamp`     |

The `package_id` column is the UUID of the dataset (and it's the primary key). The `package_data` column contains the dataset metadata as a JSONB object. The `last_modified` column is a timestamp that is automatically generated whenever `package_data` is updated.

#### Initializing the Pending Dataset Table

You can initialize the pending dataset table by running the following command:

```console
ckan -c <path-to-ini-file> pendingdatasetsdb
```

### API Endpoints

#### POST /api/action/pending_dataset_create

**Parameters:**
- **package_id** (string) – The UUID of the dataset (required).
- **package_data** (JSON object) – The dataset metadata (required).

Creates a new pending dataset and returns the newly created pending dataset.

#### POST /api/action/pending_dataset_update

**Parameters:**
- **package_id** (string) – The UUID of the dataset (required).
- **package_data** (JSON object) – The dataset metadata (required).

Updates an existing pending dataset and returns the updated pending dataset.

#### POST /api/action/pending_dataset_delete

**Parameters:**
- **package_id** (string) – The UUID of the dataset (required).

Deletes an existing pending dataset.

#### GET /api/action/pending_dataset_show

**Parameters:**
- **package_id** (string) – The UUID of the dataset (required).

Returns the pending dataset for the given `package_id`.

#### GET /api/action/pending_diff_show

**Parameters:**
- **package_id** (string) – The UUID of the dataset (required).

Returns the diff between the pending dataset and the existing dataset for the given `package_id`.

Here's an example:

```json
{
    "help": "http://ckan-dev:5000/api/3/action/help_show?name=pending_diff_show",
    "success": true,
    "result": {
        "title": {
            "old_value": "My dataset title",
            "new_value": "My better dataset title"
        },
        "application": {
            "old_value": "",
            "new_value": "wri"
        },
        "resources[0].description": {
            "old_value": "My resource description",
            "new_value": "My better resource description"
        },
        "resources[0].format": {
            "old_value": "CSV",
            "new_value": "HTML"
        },
        "resources[1].title": {
            "old_value": "My resource title",
            "new_value": "My better resource title"        },
        "wri_data": {
            "old_value": false,
            "new_value": true
        },
        "cautions": {
            "old_value": "",
            "new_value": "This is a caution"
        },
        "languages": {
            "old_value": [
                "fr"
            ],
            "new_value": [
                "en"
            ]
        },
        "function": {
            "old_value": "The function of this dataset is to x...",
            "new_value": "The function of this dataset is to y..."
        },
    },
}
```

## Migration API

This extension includes a migration API that allows users to migrate datasets from RW to CKAN.

### API Endpoints

#### POST /api/3/action/migrate_dataset

**Note**: The functionality of this endpoint is limited to the user's permissions in CKAN. For example, if a user has the correct permissions to create a dataset but doesn't have permissions to add it to the Team or Topic specified, the request will return an authorization error.

Migrates an RW dataset/metadata to CKAN. It maps all supported RW fields to CKAN fields. All additional RW fields (except objects) are stored in the `migration_extras` field of the CKAN dataset. This endpoint handles both the creation and updating of datasets (this is determined automatically—no need to specify).

**Parameters:**
- **id** (string) – The RW UUID of the dataset to migrate (required—unless `gfw_dataset` is provided). Example: `c0b5f4b1-4f3b-4f1e-8f1e-3f4b1f3b4f1e`.
- **application** (string) – The RW application of the dataset to migrate (required). Example: `rw`.
- **gfw_dataset** (string) – The GFW dataset to migrate (optional—if this dataset also has metadata in the RW API, you should also include `id`). Example: `gfw_forest_data`.
- **gfw_version** (string) – The version of the GFW dataset to migrate (optional—will default to the latest if a specific version isn't provided). Example: `v2020.01.01`.
- **team** (string) – The `name` (`slug`) of the Team to associate the dataset with (optional). Example: `land-carbon-lab`.
- **topics** (string) – A comma-separated list of Topic `slug`s to associate the dataset with (optional). Example: `atmosphere,biodiversity`.
- **geographic_coverage** (string) – The geographic coverage of the dataset (optional). Example: `Global`.
- **maintainer** (string) – The `name` of the dataset maintainer (optional). Example: `John Doe`.
- **maintainer_email** (string) – The email of the dataset maintainer (optional). Example: `john.doe@example.com`.
- **layer_ids** (string) – A comma-separated list of RW Layer UUIDs to associate with the dataset (optional). All other layers will be skipped. Example: `c0b5f4b1-4f3b-4f1e-8f1e-3f4b1f3b4f1e,c0b5f4b1-4f3b-4f1e-8f1e-3f4b1f3b4f1e`.
- **blacklist** (string) – A comma-separated list of CKAN fields to exclude from the migration mapping (optional—cannot be used with `whitelist`). Example: `resources,notes` will exclude the `resources` (Layers) and `notes` (Description) fields from the migration mapping.
- **whitelist** (string) – A comma-separated list of CKAN fields to include in the migration mapping (optional—cannot be used with `blacklist`). Example: `title,notes` will only include the `title` (Title) and `notes` (Description) fields in the migration mapping.

A successful request will return the Prefect status of the new migration job.

##### Usage Example

```
% curl -H "Authorization: YOUR_API_TOKEN" "https://wri.dev.ckan.datopian.com/api/3/action/migrate_dataset?id=c12446ce-174f-4ffb-b2f7-77ecb0116aba&application=rw&team=migration-test&topics=lucas-topic,nov-16-topic"
{
  "help": "https://wri.dev.ckan.datopian.com/api/3/action/help_show?name=migration_status",
  "success": true,
  "result": {
    "id": "2b3d8bf5-80a1-4816-a2f0-55a97f720471",
    "created": "2024-04-19T16:25:50.064208+00:00",
    "updated": "2024-04-19T16:26:09.039985+00:00",
    "name": "masked-penguin",
    "flow_id": "0c5a71cd-ce9f-448e-8453-366cbb6944c0",
    "state_id": "142982aa-2c10-4859-b2fd-68beb2be7bdf",
    "deployment_id": "7191012a-0572-4dfe-8e0d-be5de4acc39c",
    "work_queue_id": null,
    "work_queue_name": null,
    "flow_version": "659bece7fac5af816d61217219193235",
    "parameters": {
      "data_dict": {
        "id": "c12446ce-174f-4ffb-b2f7-77ecb0116aba",
        "team": "migration-test",
        "topics": [
          "lucas-topic",
          "nov-16-topic"
        ],
        "application": "rw"
      }
    },
    "idempotency_key": null,
    "context": {},
    "empirical_policy": {
      "max_retries": 0,
      "retry_delay_seconds": 0,
      "retries": 0,
      "retry_delay": 0,
      "pause_keys": [],
      "resuming": false
    },
    "tags": [],
    "parent_task_run_id": null,
    "state_type": "COMPLETED",
    "state_name": "Completed",
    "run_count": 1,
    "expected_start_time": "2024-04-19T16:25:50.064030+00:00",
    "next_scheduled_start_time": null,
    "start_time": "2024-04-19T16:26:03.090073+00:00",
    "end_time": "2024-04-19T16:26:09.038686+00:00",
    "total_run_time": 5.948613,
    "estimated_run_time": 5.948613,
    "estimated_start_time_delta": 13.026043,
    "auto_scheduled": false,
    "infrastructure_document_id": null,
    "infrastructure_pid": null,
    "created_by": null,
    "work_pool_id": null,
    "work_pool_name": null,
    "state": {
      "id": "142982aa-2c10-4859-b2fd-68beb2be7bdf",
      "type": "COMPLETED",
      "name": "Completed",
      "timestamp": "2024-04-19T16:26:09.038686+00:00",
      "message": null,
      "data": {
        "type": "unpersisted"
      },
      "state_details": {
        "flow_run_id": "2b3d8bf5-80a1-4816-a2f0-55a97f720471",
        "task_run_id": null,
        "child_flow_run_id": null,
        "scheduled_time": null,
        "cache_key": null,
        "cache_expiration": null,
        "untrackable_result": false,
        "pause_timeout": null,
        "pause_reschedule": false,
        "pause_key": null,
        "run_input_keyset": null,
        "refresh_cache": null
      }
    }
  }
}
```

You'll need this ID: `"id": "2b3d8bf5-80a1-4816-a2f0-55a97f720471"` (`result.id`) to check the status of the migration job at a later time.

#### POST /api/3/action/trigger_migration

**Note**: This endpoint is currently only available to system admins.

Triggers a full migration of RW datasets/metadata using the pre-defined [`datasets.csv` file](../../../migration/files/datasets.csv). Optionally, the `file_name` parameter can be used to point to another file (e.g. `?file_name=my_file.csv`—only provide the file name, not the path, as the assumed path is `migration/files/<FILE_NAME>`). The files must be placed in the same directory as `datasets.csv`. This endpoint handles both the creation and updating of datasets (this is determined automatically—no need to specify).

**Parameters:**
- **blacklist** (string) – A comma-separated list of CKAN fields to exclude from the migration mapping (optional—cannot be used with `whitelist`). Example: `resources,notes` will exclude the `resources` (Layers) and `notes` (Description) fields from the migration mapping.
- **whitelist** (string) – A comma-separated list of CKAN fields to include in the migration mapping (optional—cannot be used with `blacklist`). Example: `title,notes` will only include the `title` (Title) and `notes` (Description) fields in the migration mapping.
- **file_name** (string) – The name of the file to use for the migration (optional). Example: `my_datasets.csv`.

A successful request will return the Prefect status of the new migration job.

##### Usage Example

Same as above, but with the `/trigger_migration` endpoint.

```
% curl -H "Authorization: YOUR_API_TOKEN" "https://wri.dev.ckan.datopian.com/api/3/action/trigger_migration"
{
  "help": "https://wri.dev.ckan.datopian.com/api/3/action/help_show?name=trigger_migration",
  "success": true,
  "result": {
    "id": "7cd8a09e-1834-4ab5-8b72-bd638e9392ae",
    "created": "2024-04-19T13:35:02.161350+00:00",
    "updated": "2024-04-19T13:35:02.158656+00:00",
    "name": "hospitable-barracuda",
    "flow_id": "0c5a71cd-ce9f-448e-8453-366cbb6944c0",
    "state_id": "ecfa19b2-dd38-4434-a167-974fd8149b68",
    "deployment_id": "7191012a-0572-4dfe-8e0d-be5de4acc39c",
    "work_queue_id": null,
    "work_queue_name": null,
    "flow_version": null,
    "parameters": {
      "data_dict": {
        "is_bulk": true
      }
    },
    "idempotency_key": null,
    "context": {},
    "empirical_policy": {
      "max_retries": 0,
      "retry_delay_seconds": 0,
      "retries": null,
      "retry_delay": null,
      "pause_keys": [],
      "resuming": false
    },
    "tags": [],
    "parent_task_run_id": null,
    "state_type": "SCHEDULED",
    "state_name": "Scheduled",
    "run_count": 0,
    "expected_start_time": "2024-04-19T13:35:02.161117+00:00",
    "next_scheduled_start_time": "2024-04-19T13:35:02.161117+00:00",
    "start_time": null,
    "end_time": null,
    "total_run_time": 0,
    "estimated_run_time": 0,
    "estimated_start_time_delta": 0.035684,
    "auto_scheduled": false,
    "infrastructure_document_id": null,
    "infrastructure_pid": null,
    "created_by": null,
    "work_pool_id": null,
    "work_pool_name": null,
    "state": {
      "id": "ecfa19b2-dd38-4434-a167-974fd8149b68",
      "type": "SCHEDULED",
      "name": "Scheduled",
      "timestamp": "2024-04-19T13:35:02.161053+00:00",
      "message": null,
      "data": null,
      "state_details": {
        "flow_run_id": "7cd8a09e-1834-4ab5-8b72-bd638e9392ae",
        "task_run_id": null,
        "child_flow_run_id": null,
        "scheduled_time": "2024-04-19T13:35:02.161117+00:00",
        "cache_key": null,
        "cache_expiration": null,
        "untrackable_result": false,
        "pause_timeout": null,
        "pause_reschedule": false,
        "pause_key": null,
        "run_input_keyset": null,
        "refresh_cache": null
      }
    }
  }
}
```

You'll need this ID: `"id": "7cd8a09e-1834-4ab5-8b72-bd638e9392ae"` (`result.id`) to check the status of the migration job at a later time.

##### Custom Migration Files

Add a custom file to the `migration/files` directory and commit it to the repo. Once deployed, you can use the `file_name` parameter to specify it. The file should be a CSV with the following columns:

- `dataset_id` (required—unless `gfw_dataset` is provided)
- `application` (required)
- `team` (optional)
- `topics` (optional)
- `geographic_coverage` (optional)
- `maintainer` (optional)
- `maintainer_email` (optional)
- `layer_ids` (optional)
- `gfw_dataset` (optional)
- `gfw_version` (optional)

Example:

```csv
dataset_id,gfw_dataset,application,team,topics,geographic_coverage,maintainer,maintainer_email,layer_ids
d491f094-ad6e-4015-b248-1d1cd83667fa,,aqueduct-water-risk,aqueduct,"freshwater,surface-water-bodies",Global,John Doe,john.doe@example.com,,
b318381e-485d-46c9-8958-c9a9d75d7e91,,aqueduct-water-risk,aqueduct,"freshwater,water-risks",Global,John Doe,john.doe@example.com,,
faf79d2c-5e54-4591-9d70-4bd1029c18e6,,crt,agriadapt,atmosphere,Global,Jane Doe,jane.doe@example.com,,
,gfw_forest_flux_forest_age_category,gfw,global-forest-watch,"land,ghg-emissions,forest",,Jane Doe,jane.doe@example.com,,
,gfw_forest_flux_removal_forest_type,gfw,global-forest-watch,"land,ghg-emissions,forest",,John Doe,john.doe@example.com,,
47a8e6cc-ea40-44a8-b1fc-6cf4fcc7d868,nasa_viirs_fire_alerts,gfw,global-forest-watch,"land,natural-hazards,forest",Global,,,2462cceb-41de-4bd2-8251-a6f75fe4e3d5
c92b6411-f0e5-4606-bbd9-138e40e50eb8,,gfw,global-forest-watch,"land,forest",,Jeff Guy,jeff.guy@example.com,"0cba3c4f-2d3b-4fb1-8c93-c951dc1da84b,2351399c-ef2c-48da-9485-20698190acb0"
```

#### POST /api/3/action/migration_status

Returns the status of the specified migration job in Prefect.

**Parameters:**
- **id** (string) – The Prefect flow run ID (required). This is found at `result.id` in the response from the `/migrate_dataset` or `/trigger_migration` endpoints.

A successful request will return the current status of the migration job.

##### Usage Example

The following uses the flow run ID from the `/migrate_dataset` endpoint example above:

```
% curl -H "Authorization: YOUR_API_TOKEN" "https://wri.dev.ckan.datopian.com/api/3/action/migration_status?id=2b3d8bf5-80a1-4816-a2f0-55a97f720471"
{
  "help": "https://wri.dev.ckan.datopian.com/api/3/action/help_show?name=migration_status",
  "success": true,
  "result": {
    "id": "2b3d8bf5-80a1-4816-a2f0-55a97f720471",
    "created": "2024-04-19T16:25:50.064208+00:00",
    "updated": "2024-04-19T16:26:09.039985+00:00",
    "name": "masked-penguin",
    "flow_id": "0c5a71cd-ce9f-448e-8453-366cbb6944c0",
    "state_id": "142982aa-2c10-4859-b2fd-68beb2be7bdf",
    "deployment_id": "7191012a-0572-4dfe-8e0d-be5de4acc39c",
    "work_queue_id": null,
    "work_queue_name": null,
    "flow_version": "659bece7fac5af816d61217219193235",
    "parameters": {
      "data_dict": {
        "id": "c12446ce-174f-4ffb-b2f7-77ecb0116aba",
        "team": "migration-test",
        "topics": [
          "lucas-topic",
          "nov-16-topic"
        ],
        "application": "rw"
      }
    },
    "idempotency_key": null,
    "context": {},
    "empirical_policy": {
      "max_retries": 0,
      "retry_delay_seconds": 0,
      "retries": 0,
      "retry_delay": 0,
      "pause_keys": [],
      "resuming": false
    },
    "tags": [],
    "parent_task_run_id": null,
    "state_type": "COMPLETED",
    "state_name": "Completed",
    "run_count": 1,
    "expected_start_time": "2024-04-19T16:25:50.064030+00:00",
    "next_scheduled_start_time": null,
    "start_time": "2024-04-19T16:26:03.090073+00:00",
    "end_time": "2024-04-19T16:26:09.038686+00:00",
    "total_run_time": 5.948613,
    "estimated_run_time": 5.948613,
    "estimated_start_time_delta": 13.026043,
    "auto_scheduled": false,
    "infrastructure_document_id": null,
    "infrastructure_pid": null,
    "created_by": null,
    "work_pool_id": null,
    "work_pool_name": null,
    "state": {
      "id": "142982aa-2c10-4859-b2fd-68beb2be7bdf",
      "type": "COMPLETED",
      "name": "Completed",
      "timestamp": "2024-04-19T16:26:09.038686+00:00",
      "message": null,
      "data": {
        "type": "unpersisted"
      },
      "state_details": {
        "flow_run_id": "2b3d8bf5-80a1-4816-a2f0-55a97f720471",
        "task_run_id": null,
        "child_flow_run_id": null,
        "scheduled_time": null,
        "cache_key": null,
        "cache_expiration": null,
        "untrackable_result": false,
        "pause_timeout": null,
        "pause_reschedule": false,
        "pause_key": null,
        "run_input_keyset": null,
        "refresh_cache": null
      }
    }
  }
}
```

The most important part of the response is the `state` object, which contains the current state of the migration job. The actual status can be found at `result.state.name` or `result.state.type`.

#### Blacklist/Whitelist Supported Fields

The following fields are supported for the `blacklist` and `whitelist` parameters (all other fields do not currently have a direct mapping):

- `cautions` - Maps to `cautions` in the RW dataset.
- `citation` - Maps to `citation` in the RW dataset.
- `function` - Maps to `function` or `functions` in the RW dataset.
- `language` - Maps to `language` in the RW dataset. **Note**: This field in CKAN requires an ISO 639-1 language code. If the incoming language is not an ISO 639-1 code, it will be ignored.
- `learn_more` - Maps to the `learn_more_link` in the RW dataset.
- `notes` - Maps to `description` in the RW dataset.
- `resources` - Maps to the Layers in the RW dataset. Each Layer is mapped to a CKAN resource.
- `title` - Maps to `name` in the RW dataset if exists, otherwise, uses the same slugified name.
- `url` - Maps to the `data_download_original_link` if exists, otherwise, uses `data_download_link`. **Note**: This field in CKAN requires a valid URL. If the incoming URL is not valid, it will be ignored.

In all cases above, both the RW metadata and dataset are checked for a value, defaulting to the RW metadata value if it exists. In most cases, there's no comparable key/value in the RW dataset, but there are a few cases where the RW dataset has a key that's not in the RW metadata.

#### Unsupported Fields

Most fields that are not mapped directly to CKAN are stored in a custom field called `migration_extras` (Note: some data is not migrated, such as objects, e.g., the full layer metadata, application config, etc.). This field holds a JSON object where the keys are the paths within the source dataset objects and the values are the values of those paths. For example:

```json
{
  ... (other CKAN dataset fields) ...
  "migration_extras": {
    "dataset.dataPath": "None",
    "metadata.info.sources.0.id": "0",
    "metadata.info.citation": "National Geospatial Intelligence Agency. 2019. \"World Port Index.\" Accessed from https://msi.nga.mil/NGAPortal/MSI.portal?_nfpb=true&_pageLabel=msi_portal_page_62&pubCode=0015. Accessed through Resource Watch, (date). [www.resourcewatch.org](https://www.resourcewatch.org).",
    "metadata.updatedAt": "2022-03-18T04:56:01.316Z",
    "dataset.overwrite": "false",
    "dataset.protected": "false",
    "metadata.info.geographic_coverage": "Global",
    "metadata.info.technical_title": "World Port Index",
    "metadata.info.cautions": "Any changes to the port facilities that have occurred since the last publication will not be reflected. This reproduction, partial or complete, of any National Geospatial-Intelligence Agency (NGA), National Imagery and Mapping Agency (NIMA), or Defense Mapping Agency (DMA) product, information, or data is not approved, authorized, or endorsed by the Secretary of Defense, the Director of National Intelligence, the Director of the NGA, or any other element of the U.S. government. The U.S. government and the NGA accept no liability for the accuracy or quality of this reproduction or the use of any NGA, NIMA, or DMA products, information, or data.",
    "dataset.taskId": "None",
    "dataset.type": "tabular",
    "dataset.application.0": "rw",
    "metadata.info.data_download_link": "https://wri-public-data.s3.amazonaws.com/resourcewatch/com_017_rw2_major_ports.zip",
    "dataset.tableName": "com_017_rw2_major_ports_edit",
    "dataset.requested_application": "rw",
    "metadata.resource.type": "dataset",
    "dataset.name": "com.017.rw2 Major Ports",
    "dataset.published": "true",
    "dataset.dataLastUpdated": "None",
    "dataset.subtitle": "None",
    "metadata.info.data_type": "Vector",
    "metadata.info.license_link": "https://creativecommons.org/share-your-work/public-domain/",
    "metadata.dataset": "28d1f505-571c-4a52-8215-48ea02aa4928",
    "metadata.createdAt": "2020-09-22T17:42:17.618Z",
    "metadata.dataset_type": "metadata",
    "metadata.application": "rw",
    "dataset.createdAt": "2020-09-22T17:42:11.637Z",
    "dataset.env": "production",
    "dataset.updatedAt": "2020-09-25T13:05:42.080Z",
    "metadata.language": "en",
    "dataset.errorMessage": "",
    "dataset.mainDateField": "None",
    "metadata.info.sources.0.source-name": "",
    "metadata.source": "NGA",
    "metadata.info.sources.0.source-description": "National Geospatial-Intelligence Agency (NGA)",
    "metadata.info.license": "Public domain",
    "dataset.provider": "cartodb",
    "dataset.connectorUrl": "https://wri-rw.carto.com/tables/com_017_rw2_major_ports_edit/public",
    "metadata.resource.id": "28d1f505-571c-4a52-8215-48ea02aa4928",
    "metadata.info.frequency_of_updates": "Varies",
    "metadata.info.functions": "Locations, physical characteristics, facilities, and services offered by major ports around the world",
    "metadata.info.learn_more_link": "https://msi.nga.mil/Publications/WPI",
    "metadata.dataset_id": "5f6a3779b16c4d001a2f0f40",
    "metadata.info.spatial_resolution": "None",
    "metadata.name": "Major Ports",
    "dataset.userId": "5efe38618e222c0010996c3c",
    "dataset.dataset_type": "dataset",
    "metadata.status": "published",
    "metadata.info.name": "Major Ports",
    "dataset.connectorType": "rest",
    "metadata.info.date_of_content": "2019",
    "metadata.info.data_download_original_link": "https://msi.nga.mil/Publications/WPI",
    "metadata.info.rwId": "com.017.rw2",
    "dataset.dataset_id": "28d1f505-571c-4a52-8215-48ea02aa4928",
    "dataset.status": "saved",
    "dataset.geoInfo": "true",
    "dataset.slug": "com017rw2-Major-Ports",
    "metadata.description": "The World Port Index is created by the Maritime Security Office of the National Geospatial-Intelligence Agency (NGA) to document the locations and features of major ports around the world. The Maritime Security Office requests that mariners send it corrections in plain language, which the office subsequently codes to create a consistent record of port facilities. Resource Watch shows only a subset of the data set. For access to the full data set and additional information, see the Learn More link.  \n  \n### Additional Information  \n  \nResource Watch shows only a subset of the dataset. For access to the full dataset and additional information, click on the “Learn more” button.  \n  \n### Disclaimer  \n  \nExcerpts of this description page were taken from the source metadata.",
    "dataset.attributesPath": "None"
  },
  ... (other CKAN dataset fields) ...
}
```

## API Analytics Tracking

**Note**: This plugin requires a Google Analytics account with a Measurement ID and API Secret to work. For more information on how to set up Google Analytics, see the [Google Analytics documentation](https://support.google.com/analytics/answer/9304153?hl=en). Steps to set up reports can be found in the main `docs` directory in this repo (see [`wri-odp/docs/ga-api/README.md`](../docs/ga-api/README.md)).

This extension includes an optional plugin that sends API usage analytics to Google Analytics. To enable this feature, you need to add the `wri_api_tracking` plugin to the `ckan.plugins` list in your CKAN configuration file, just after the `wri` plugin:

```
ckan.plugins = ... wri wri_api_tracking ...
```

You also need to add the following configuration options to your CKAN configuration file (these are **required** if the `wri_api_tracking` plugin is enabled):

```
ckanext.wri.api_analytics.measurement_id = G-XXXXXXXXXX
ckanext.wri.api_analytics.api_secret = XXXXXXXXXXX
```

The plugin sends a simple event to Google Analytics whenever an API request is made. The event is tracked in Google Analytics as `ckan_api` with a few params/dimensions (`action` and `user_agent` being the most useful). This is the object that's sent to Google Analytics:

```
{
    'client_id': cid, # This is either a randomly generated UUID or the hash hex digest of the current CKAN user.
    'events': [
        {
            'name': 'ckan_api', # The event name, used to group all API events.
            'params': {
                'action': tk.request.environ['PATH_INFO'].split('/')[-1], # The API action, extracted from the URL (e.g., 'package_show').
                'user_agent': tk.request.environ.get('HTTP_USER_AGENT', ''), # The user agent of the request (e.g., "curl/8.6.0", "ckanapi/4.7", "node", etc.).
                'session_id': uuid.uuid4().hex, # A randomly generated UUID to trigger a session.
                'engagement_time_msec': 1, # Engagement time set to 1, just to trigger user engagement.
            },
        }
    ],
}
```

## Development

See the [CKAN Backend Development README](ckan-backend-dev/README.md) for instructions on how to set up a local Docker CKAN backend development environment.

This extension lives in `ckan-backend-dev/src/ckanext-wri`. It is symlinked to the root of this repo for convenience and visibility.

Because it's part of this unified repo, if you need to make changes, you can do so directly in the `ckanext-wri` directory. There's no external repo to clone or fork (like other CKAN extensions), so you can just create a new branch off of `dev`, make your changes, and submit a PR.

## Testing

The unit tests for this extension are run as part of the `make unit-tests` command in the `ckan-backend-dev` Docker development environment, but while developing, you can also run them alone. To do so, in another terminal window, go to `ckan-backend-dev` and run:

If the environment is not already running, start it:

    make up

Then enter the Docker shell:

    make shell

Once in the shell, navigate to the extension directory:

    cd src_extensions/ckanext-wri

Finally, run the tests:

    pytest --ckan-ini=test.ini ckanext/wri/tests
