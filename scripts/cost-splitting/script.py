import os
import datetime
from dotenv import load_dotenv
from lib import append_csv_to_file, get_all_orgs, get_csv_string, get_storage_for_every_org, get_total_costs

## Env variables
load_dotenv()

BUCKET_NAME = os.getenv("BUCKET_NAME")

current_date = datetime.datetime.utcnow().isoformat()
orgs = get_all_orgs(BUCKET_NAME)
total = get_total_costs(BUCKET_NAME, current_date)
orgs_storage = get_storage_for_every_org(
    BUCKET_NAME, total["storage"], orgs, current_date
)
orgs_storage.append(total)
csv_string_to_append = get_csv_string(orgs_storage)
csv_string_to_create = get_csv_string(
    orgs_storage, "date,org,storage,percentage\n"
)
print(csv_string_to_create)
append_csv_to_file(csv_string_to_append, "data/storage_costs.csv")
append_csv_to_file(
    csv_string_to_create, f"data/storage_costs_{current_date}.csv"
)
