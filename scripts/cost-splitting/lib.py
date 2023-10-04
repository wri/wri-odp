import boto3
from dotenv import load_dotenv

def get_storage_costs_from_org(bucket_name, path):
    s3 = boto3.resource("s3")
    my_bucket = s3.Bucket(bucket_name)
    total_size = 0

    for obj in my_bucket.objects.filter(Prefix=path):
        total_size = total_size + obj.size

    return total_size


def get_all_orgs(bucket):
    s3 = boto3.resource("s3")
    my_bucket = s3.Bucket(bucket)
    orgs = []
    for obj in my_bucket.objects.all():
        orgs.append(obj.key.split("/")[0])
    return list(set(orgs))


def get_total_costs(bucket_name, current_date):
    total = {
        "date": current_date,
        "org": "total",
        "storage": get_storage_costs_from_org(bucket_name, ""),
        "percentage": 1,
    }
    return total


def get_storage_for_every_org(bucket_name, total_cost, orgs, current_date):
    orgs_storage = []
    for org in orgs:
        org_storage = get_storage_costs_from_org(bucket_name, org)
        orgs_storage.append(
            {
                "date": current_date,
                "org": org,
                "storage": org_storage,
                "percentage": org_storage / total_cost,
            }
        )
    orgs_storage = sorted(orgs_storage, key=lambda k: k["org"])
    return orgs_storage


def get_csv_string(orgs_storage, initial_string=""):
    csv_string = initial_string
    for org in orgs_storage:
        csv_string += "{},{},{},{}\n".format(
            org["date"], org["org"], org["storage"], org["percentage"]
        )
    return csv_string


def append_csv_to_file(csv_string, path):
    with open(path, "a") as f:
        f.write(csv_string)
