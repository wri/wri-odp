#!/bin/sh

# Wait for MinIO to start
until mc alias set wri-minio http://minio:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD; do
  echo 'Waiting for MinIO...'
  sleep 2
done

# Check if the bucket already exists
if mc ls wri-minio/ckan; then
  echo 'Bucket "ckan" already exists. Skipping creation.'
else
  # Create the bucket
  mc mb wri-minio/ckan && echo 'Bucket "ckan" created successfully.'
fi
