import boto3
import smtplib
import requests
from email.mime.text import MIMEText

def get_org_name(org_id, branch_name):
    # make an http request to the get the org name using organization_show from ckan
    # make a get request
    try:
        r = requests.get(f'https://wri.{branch_name}.ckan.datopian.com/api/action/organization_show?id={org_id}')
        org = r.json()['result']
        return org['title']
    except:
        return org_id

def build_email(current_date, branch_name):
    body = f"Please access <a href='https://raw.githubusercontent.com/wri/wri-odp/{branch_name}/scripts/cost-splitting/data/storage_costs.csv'> here</a> to get a report with the aggregate of storage costs, you can also get a version with just the current values at <a href='https://raw.githubusercontent.com/wri/wri-odp/{branch_name}/scripts/cost-splitting/data/storage_costs_{current_date}.csv'> this link</a> "
    return MIMEText(body, "html")


def build_subject(current_date):
    subject = "AWS Storage Costs for {}".format(current_date)
    return subject


def send_email(subject, body, sender, recipients, host, port, smtp_user, password):
    msg = body
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = ", ".join(recipients)

    # This should take a config object with password, host, port, etc.
    s = smtplib.SMTP(host, port)
    s.starttls()
    s.login(smtp_user, password)
    s.sendmail(sender, recipients, msg.as_string())
    s.quit()


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


def get_storage_for_every_org(bucket_name, total_cost, orgs, current_date, branch_name):
    orgs_storage = []
    for org in orgs:
        org_storage = get_storage_costs_from_org(bucket_name, org)
        orgs_storage.append(
            {
                "date": current_date,
                "org": get_org_name(org, branch_name) if org != "resources" else "unwoned resources",
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
