!#/bin/bash

sed -i "s|ckanext.s3filestore.aws_access_key_id = test-access-key|ckanext.s3filestore.aws_access_key_id = ${AWS_ACCESS_KEY_ID}|g" src/ckanext-s3filestore/test.ini
sed -i "s|ckanext.s3filestore.aws_secret_access_key = test-secret-key|ckanext.s3filestore.aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}|g" src/ckanext-s3filestore/test.ini
sed -i "s|ckanext.s3filestore.aws_bucket_name = test-bucket|ckanext.s3filestore.aws_bucket_name = ${AWS_BUCKET_NAME}|g" src/ckanext-s3filestore/test.ini
sed -i "s|ckanext.s3filestore.host_name = http://127.0.0.1:9000|ckanext.s3filestore.host_name = ${HOST_NAME}|g" src/ckanext-s3filestore/test.ini