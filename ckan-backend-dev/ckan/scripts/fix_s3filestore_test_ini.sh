#!/bin/bash

sed -i "s|ckanext.s3filestore.aws_access_key_id = test-access-key|ckanext.s3filestore.aws_access_key_id = minioadmin|g" src/ckanext-s3filestore/test.ini
sed -i "s|ckanext.s3filestore.aws_secret_access_key = test-secret-key|ckanext.s3filestore.aws_secret_access_key = minioadmin|g" src/ckanext-s3filestore/test.ini
sed -i "s|ckanext.s3filestore.aws_bucket_name = test-bucket|ckanext.s3filestore.aws_bucket_name = ckan|g" src/ckanext-s3filestore/test.ini
sed -i "s|ckanext.s3filestore.host_name = http://127.0.0.1:9000|ckanext.s3filestore.host_name = http://minio:9000|g" src/ckanext-s3filestore/test.ini