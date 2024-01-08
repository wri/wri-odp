#!/bin/bash

# S3Filestore

sed -i "s|ckanext.s3filestore.aws_access_key_id = test-access-key|ckanext.s3filestore.aws_access_key_id = minioadmin|g" src/ckanext-s3filestore/test.ini
sed -i "s|ckanext.s3filestore.aws_secret_access_key = test-secret-key|ckanext.s3filestore.aws_secret_access_key = minioadmin|g" src/ckanext-s3filestore/test.ini
sed -i "s|ckanext.s3filestore.aws_bucket_name = test-bucket|ckanext.s3filestore.aws_bucket_name = ckan|g" src/ckanext-s3filestore/test.ini
sed -i "s|ckanext.s3filestore.host_name = http://127.0.0.1:9000|ckanext.s3filestore.host_name = http://minio:9000|g" src/ckanext-s3filestore/test.ini

# DataAPI

## Data API Test Variables
hasura_url="http://hasura-svc:80"
hasura_admin_key="test123546789"
hasura_db="WRI Datastore"

## DataAPI test.ini File path
file_path="/srv/app/src/ckanext-data-api/test.ini"

## Add variables to the file
echo "ckanext.data_api.hasura_url=\"$hasura_url\"" >> "$file_path"
echo "ckanext.data_api.admin_key=\"$hasura_admin_key\"" >> "$file_path"
echo "ckanext.data_api.hasura_db=\"$hasura_db\"" >> "$file_path"