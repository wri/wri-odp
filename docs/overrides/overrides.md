# CKAN Core Overrides and Patches

## CKAN Patches

In some cases, code within CKAN core needs to be modified for a specific reason, and the changes might not be fit for a pull request to the CKAN core repository. Patches are a way to do this at runtime instead of modifying the CKAN core code directly.

Additionally, a patch might include a fix that has been handled in a newer release of CKAN, but the current pinned version of CKAN and the fix hasn't yet been (or won't be) backported to the version we are using.

### WRI Patches

We currently have 3 patches in place:

1. **Group Org List**: A patch that fixes a bug in CKAN core where the environment variable to specify the max number of results for organization and group list API endpoints isn't working. The patch is located in [wri-odp/ckan-backend-dev/ckan/patches/ckan/01_group_org_list.patch](https://github.com/wri/wri-odp/blob/prod/ckan-backend-dev/ckan/patches/ckan/01_group_org_list.patch):
    ```patch
    diff --git a/ckan/logic/action/get.py b/ckan/logic/action/get.py
    index 4002e2d33..89f422389 100644
    --- a/ckan/logic/action/get.py
    +++ b/ckan/logic/action/get.py
    @@ -355,7 +355,7 @@ def _group_or_org_list(
             except ValueError:
                 max_limit = 1000

    -    if limit is None or int(limit) > max_limit:
    +    if limit is None or int(limit) > int(max_limit):
             limit = max_limit

         # order_by deprecated in ckan 1.8
    ```

2. **Roles**: A patch that updates the cascading group roles in CKAN so that they only cascade for admins. This prevents non-admin users from gaining access to child groups without explicit permission. The patch is located in [wri-odp/ckan-backend-dev/ckan/patches/ckan/01_roles.patch](https://github.com/wri/wri-odp/blob/prod/ckan-backend-dev/ckan/patches/ckan/01_roles.patch):
    ```patch
    diff --git a/ckan/ckan/authz.py b/ckan/ckan/authz.py
    --- ckan/ckan/authz.py
    +++ ckan/ckan/authz.py
    @@ -318,9 +318,9 @@
         if not user_id:
             return False
         if _has_user_permission_for_groups(user_id, permission, [group_id]):
             return True
    -    capacities = check_config_permission('roles_that_cascade_to_sub_groups')
    +    capacities = ['admin']
         assert isinstance(capacities, list)
         # Handle when permissions cascade. Check the user's roles on groups higher
         # in the group hierarchy for permission.
         for capacity in capacities:
    ```
3. **Tests Reset DB**: A patch that adds code to drop the custom spatial reference tables when cleaning up during automated tests. The patch is located in [wri-odp/ckan-backend-dev/ckan/patches/ckan/02_tests_reset_db.patch](https://github.com/wri/wri-odp/blob/prod/ckan-backend-dev/ckan/patches/ckan/02_tests_reset_db.patch):
    ```patch
    diff --git a/ckan/ckan/model/__init__.py b/ckan/ckan/model/__init__.py
    --- ckan/ckan/model/__init__.py
    +++ ckan/ckan/model/__init__.py
    @@ -219,8 +219,13 @@
             with warnings.catch_warnings():
                 warnings.filterwarnings('ignore', '.*(reflection|tsvector).*')
                 meta.metadata.reflect()

    +        tables = meta.metadata.sorted_tables
    +        for table in tables:
    +            if table.name == "spatial_ref_sys":
    +                meta.metadata.remove(table)
    +
             meta.metadata.drop_all()
             self.tables_created_and_initialised = False
             log.info('Database tables dropped')
    ```

## CKAN Overrides

In the following sections, only the changes to the existing logic are listed.

### Actions (CRUD Operations)

#### Create

You can find the following overrides in [wri-odp/ckan-backend-dev/src/ckanext-wri/ckanext/wri/logic/action/create.py](https://github.com/wri/wri-odp/blob/prod/ckan-backend-dev/src/ckanext-wri/ckanext/wri/logic/action/create.py):
- `package_create`
    - Approval Workflow logic (e.g., checking the `approval_status`, `is_approved`, and `is_pending` fields, then approving/rejecting)
    - Creates pending datasets
    - Stringifies the Author/Maintainer arrays of objects (to avoid object incompatibilites with Solr indexing)
    - Sends notifications
- `old_package_create` (This is an almost exact copy of the CKAN core `package_create` logic)
    - Stringifies the Author/Maintainer arrays of objects
- `resource_create` (This is an almost exact copy of the CKAN core `resource_create` logic)
    - Stringifies the Author/Maintainer arrays of objects

#### Read

You can find the following overrides in [wri-odp/ckan-backend-dev/src/ckanext-wri/ckanext/wri/logic/action/get.py](https://github.com/wri/wri-odp/blob/prod/ckan-backend-dev/src/ckanext-wri/ckanext/wri/logic/action/get.py):
- `package_search`
    - Fixed an issue with boolean values (e.g., getting different results when the backend queries using `true` vs. `True`)
    - Improved performance
    - Add better error handling when a package creator user is not found
- `dashboard_activity_listv2` (Extends the CKAN core `dashboard_activity_list` logic)
    - Retrieves the results of `dashboard_activity_list` and adds user details to the response for activity notifications
- `package_activity_list_wri` (Extends the CKAN core `package_activity_list` logic)
    - Retrieves the results of `package_activity_list` and adds user details to the response for activity notifications
- `organization_activity_list_wri` (Extends the CKAN core `organization_activity_list` logic)
    - Retrieves the results of `organization_activity_list` and adds user details to the response for activity notifications
- `group_activity_list_wri` (Extends the CKAN core `group_activity_list` logic)
    - Retrieves the results of `group_activity_list` and adds user details to the response for activity notifications
- `user_list_wri` (Extends the CKAN core `user_list` logic)
    - Retrieves the results of `user_list` and adds user details to the response for activity notifications
- `group_list_wri` (Extends the CKAN core `group_list` logic)
    - Retrieves the results of `group_list` and adds the related hierarchy to the response
- `group_list_authz_wri` (Extends the CKAN core `group_list_authz` logic)
    - Retrieves the results of `group_list_authz` and adds the related hierarchy to the response
- `organization_list_for_user_wri` (Extends the CKAN core `organization_list_for_user` logic)
    - Retrieves the results of `organization_list_for_user` and adds the related hierarchy to the response
- `package_collaborator_list_wri`
    - Adds additional user details to the response
- `resource_search`
    - Adds spatial/geolocation search via `geoalchemy2`

#### Update

You can find the following overrides in [wri-odp/ckan-backend-dev/src/ckanext-wri/ckanext/wri/logic/action/update.py](https://github.com/wri/wri-odp/blob/prod/ckan-backend-dev/src/ckanext-wri/ckanext/wri/logic/action/update.py):
- `package_patch`
    - Calls the pending dataset API endpoints instead of patching/updating the dataset immediately (for the Approval Workflow)
    - Various checks and validations for the Approval Workflow
    - Sends notifications
- `old_package_update` (This is an almost exact copy of the CKAN core `package_update` logic)
    - Stringifies the Author/Maintainer arrays of objects
- `old_package_patch` (This is an almost exact copy of the CKAN core `package_patch` logic)
    - Stringifies the Author/Maintainer arrays of objects
- `resource_update` (This is an almost exact copy of the CKAN core `resource_update` logic)
    - Stringifies the Author/Maintainer arrays of objects

#### Delete

None currently.

### Auth (CRUD Authorization)

You can find the following overrides in [wri-odp/ckan-backend-dev/src/ckanext-wri/ckanext/wri/logic/auth/auth.py](https://github.com/wri/wri-odp/blob/prod/ckan-backend-dev/src/ckanext-wri/ckanext/wri/logic/auth/auth.py):
- `package_create`
    - Approval Workflow logic (e.g., checking the permissions of the current user before allowing them to create a dataset that's publicly visible and approved)
- `package_update`
    - Approval Workflow logic (e.g., checking the permissions of the current user before allowing them to change the approval status of a dataset)

### Mailer

You can find the following overrides in [wri-odp/ckan-backend-dev/src/ckanext-wri/ckanext/wri/lib/mailer.py](https://github.com/wri/wri-odp/blob/prod/ckan-backend-dev/src/ckanext-wri/ckanext/wri/lib/mailer.py):
- `get_reset_link`
    - Changes the reset URL to use the frontend URL instead of the backend URL

### Action View

You can find the following overrides in [wri-odp/ckan-backend-dev/src/ckanext-wri/ckanext/wri/views/api.py](https://github.com/wri/wri-odp/blob/prod/ckan-backend-dev/src/ckanext-wri/ckanext/wri/views/api.py):
- `action`
    - Intercepts all calls to `/api/action`, `/api/2/action`, and `/api/3/action` and sends API analytics data to Google Analytics (if not from the frontend portal)

### Plugin

The functions below are provided by CKAN for the purpose of extending the core functionality. They're not necessarily overrides in the same sense as the other sections, but they are still customizations to the CKAN core (and technically overrides).

You can find the following overrides in [wri-odp/ckan-backend-dev/src/ckanext-wri/ckanext/wri/plugin.py](https://github.com/wri/wri-odp/blob/prod/ckan-backend-dev/src/ckanext-wri/ckanext/wri/plugin.py):
- `dataset_facets`
    - Adds fields from the custom dataset schema to the facets
        - `language`
        - `project`
        - `temporal_coverage_start`
        - `temporal_coverage_end`
        - `update_frequency`
        - `license_id`
        - `visibility_type`
        - `featured_dataset`
        - `wri_data`
- `get_dataset_labels`
    - Adds custom logic for the Approval Workflow and collaborators
- `get_user_datasets_labels`
    - Adds custom logic for the Approval Workflow and collaborators
- `after_resource_create`
    - Adds a call to index the resource spatially/geographically
- `after_resource_update`
    - Adds a call to index the resource spatially/geographically
- `after_dataset_create`
    - Adds a loop to send each resource directly to datapusher
- `after_dataset_update`
    - Adds a loop to send each resource directly to datapusher
- `after_dataset_show`
    - Unstringifies the Author/Maintainer arrays of objects
- `before_dataset_index`
    - Stringifies the Author/Maintainer arrays of objects before indexing (to avoid object incompatibilities with Solr indexing)
    - Adds spatial/geolocation indexing
- `before_dataset_search`
    - Adds spatial/geolocation search
