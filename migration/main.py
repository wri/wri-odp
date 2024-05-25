from prefect import flow, serve, get_run_logger

from tasks.migration_task import get_datasets_from_csv, send_migration_dataset

import csv
import datetime
import os


DEPLOYMENT_ENV = os.environ["FLOW_DEPLOYMENT_ENV"]


@flow
def trigger_migration(data_dict):
    log = get_run_logger()
    is_bulk = data_dict.get("is_bulk", False)
    file_name = data_dict.get("file_name", "datasets.csv")

    if is_bulk:
        start_time = datetime.datetime.now().strftime("%Y-%m-%d_%H:%M:%S")
        dataset_csv = [["dataset_id", "rw_url", "ckan_url"]]

        datasets = get_datasets_from_csv(file_name)

        for data in datasets:
            data.update(data_dict)
            migration, rw_url, ckan_url, dataset_id = send_migration_dataset(data)

            if rw_url and ckan_url:
                dataset_csv.append([dataset_id, rw_url, ckan_url])

        with open(f"flow_logs/bulk_migration_{start_time}.csv", "w") as f:
            writer = csv.writer(f)
            writer.writerows(dataset_csv)

        msg = "Full migration task"

    else:
        start_time = datetime.datetime.now().strftime("%Y-%m-%d_%H:%M:%S")
        migration, rw_url, ckan_url, dataset_id = send_migration_dataset(data_dict)

        if rw_url and ckan_url:
            with open(f"flow_logs/dataset_migration_{start_time}.csv", "w") as f:
                writer = csv.writer(f)
                writer.writerows(
                    [
                        ["dataset_id", "rw_url", "ckan_url"],
                        [dataset_id, rw_url, ckan_url],
                    ]
                )

        msg = "Migration task"

    return msg


if __name__ == "__main__":
    migration_deployment = trigger_migration.to_deployment(
        name=f"migration_deployment_{DEPLOYMENT_ENV}",
        enforce_parameter_schema=False,
        is_schedule_active=False,
    )

    serve(migration_deployment)
