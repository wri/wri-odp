<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [ckanext-wri](#ckanext-wri)
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

The parameters `time_sent` (set to the current timestamp) and `is_unread` (set to `false`) are automatically configured during creation.

#### POST /api/action/notification_update

**Parameters:**
- **recipient_id** (string) – The user ID of the recipient of the notification (required).
- **sender_id** (string) – The user ID of the sender of the notification (required).
- **activity_type** (string) – The type of activity that triggers the notification, such as `dataset_create`, etc. (required).
- **object_type** (string) – The type of the object on which the action is being performed (e.g., dataset, resource, etc.) (required).
- **object_id** (string) – The ID of the object on which the action is being performed (required).
- **time_sent** (datetime with timezone) – The timestamp of the sent time (required).
- **is_unread** (string) – Indicates whether the notification is read or not (required).

#### GET /api/action/notification_get_all

Returns a list of notifications for a sender or recipient.

**Parameters:**
- **recipient_id** (string) – The user ID of the recipient of the notification (optional, but either `recipient_id` or `sender_id` is required).
- **sender_id** (string) – The user ID of the sender of the notification (optional, but either `recipient_id` or `sender_id` is required).

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
