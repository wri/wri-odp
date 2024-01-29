import boto3
from moto import mock_s3
import pytest
import os
from lib import get_all_orgs, get_storage_for_every_org, get_total_costs

@pytest.fixture
def s3_boto():
    """Create an S3 boto3 client and return the client object"""
    
    os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
    os.environ["AWS_ACCESS_KEY_ID"] = "testing"
    s3 = boto3.client('s3', region_name='us-east-1')
    return s3

@mock_s3
def test_list_of_orgs(s3_boto):
    """Test if we can get a list of all orgs"""

    bucket = "testbucket"
    key = "org_test_1/test_file"
    key_2 = "org_test_2/test_file"
    body = "hello world"
    s3_boto.create_bucket(Bucket=bucket)
    s3_boto.put_object(Bucket=bucket, Key=key, Body=body)
    s3_boto.put_object(Bucket=bucket, Key=key_2, Body=body)
    ## get all orgs sorted
    all_orgs = get_all_orgs(bucket)
    all_orgs.sort()
    assert all_orgs == ['org_test_1', 'org_test_2']

@mock_s3
def test_storage_report(s3_boto):
    """Test if the storage reports are accurate hello world will have 11 bytes therefore each org should have 11 bytes stored"""

    bucket = "testbucket"
    key = "org_test_1/test_file"
    key_2 = "org_test_2/test_file"
    body = "hello world"
    s3_boto.create_bucket(Bucket=bucket)
    s3_boto.put_object(Bucket=bucket, Key=key, Body=body)
    s3_boto.put_object(Bucket=bucket, Key=key_2, Body=body)
    ## get total cost
    total_cost = get_total_costs(bucket, "")
    all_orgs = get_all_orgs(bucket)
    assert total_cost['storage'] == 22
    storage_report = get_storage_for_every_org(bucket, total_cost['storage'], all_orgs, "", "dev")
    assert storage_report[0]['storage'] == 11
