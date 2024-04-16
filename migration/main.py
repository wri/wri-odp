from prefect import flow, serve, get_run_logger

from tasks.migration_task import get_datasets_from_csv, send_migration_dataset

import csv
import datetime


@flow
def trigger_migration(data_dict):
    log = get_run_logger()
    is_bulk = data_dict.get('is_bulk', False)

    if is_bulk:
        start_time = datetime.datetime.now().strftime('%Y-%m-%d_%H:%M:%S')
        dataset_csv = [['dataset_id', 'rw_url', 'ckan_url']]

        datasets = get_datasets_from_csv()

        for data in datasets:
            migration, rw_url, ckan_url, dataset_id = send_migration_dataset(data)

            if rw_url and ckan_url:
                dataset_csv.append(
                    [dataset_id, rw_url, ckan_url]
                )

        with open(f'dataset_migration_{start_time}.csv', 'w') as f:
            writer = csv.writer(f)
            writer.writerows(dataset_csv)

        msg = 'Full migration task'

    else:
        send_migration_dataset(data_dict)

        msg = 'Migration task'

    return msg


if __name__ == "__main__":
    migration_deployment = trigger_migration.to_deployment(
        name='migration_deployment',
        enforce_parameter_schema=False,
        is_schedule_active=False,
    )

    serve(migration_deployment)
