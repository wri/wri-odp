from prefect import flow,task

@task
def migration_task():
    msg = 'Hello from Task'
    return msg

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
    trigger_migration()
