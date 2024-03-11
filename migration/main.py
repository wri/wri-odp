from prefect import flow, get_run_logger, serve

from tasks.migration_task import migration_task

@flow
def migration_subflow_function():
    result = 10
    return(result)

@flow
def trigger_migration():
    sub_flow_message = migration_subflow_function()
    task_message = migration_task()
    new_message = task_message + str(sub_flow_message)
    print(new_message)

if __name__ == "__main__":
    migration_deployment = trigger_migration.to_deployment(
        name='migration_deployment',
        enforce_parameter_schema=False,
        is_schedule_active=False,
    )
    serve(migration_deployment)
