import os
import datetime
from dotenv import load_dotenv
from lib import (
    append_csv_to_file,
    build_email,
    build_subject,
    get_all_orgs,
    get_csv_string,
    get_storage_for_every_org,
    get_total_costs,
    send_email,
)

## Env variables
load_dotenv()

EMAIL_RECIPIENTS = os.getenv("EMAIL_RECIPIENTS")
SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_SENDER = os.getenv("SMTP_SENDER")
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PORT = os.getenv("SMTP_PORT")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
BRANCH_NAME = os.getenv("BRANCH_NAME")

BUCKET_NAME = f"ckan-{BRANCH_NAME}-storage"

current_date = datetime.datetime.utcnow().isoformat()

# Get storage report
orgs = get_all_orgs(BUCKET_NAME)
total = get_total_costs(BUCKET_NAME, current_date)
orgs_storage = get_storage_for_every_org(
    BUCKET_NAME, total["storage"], orgs, current_date
)
orgs_storage.append(total)

# Create CSV Files 
csv_string_to_append = get_csv_string(orgs_storage)
csv_string_to_create = get_csv_string(orgs_storage, "date,org,storage,percentage\n")
append_csv_to_file(csv_string_to_append, "data/storage_costs.csv")
append_csv_to_file(csv_string_to_create, f"data/storage_costs_{current_date}.csv")

# Send email with link
if EMAIL_RECIPIENTS and EMAIL_RECIPIENTS != "":
    send_email(
        build_subject(current_date),
        build_email(current_date, BRANCH_NAME),
        SMTP_SENDER,
        EMAIL_RECIPIENTS.split(","),
        SMTP_SERVER,
        SMTP_PORT,
        SMTP_USER,
        SMTP_PASSWORD,
    )
