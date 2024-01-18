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
