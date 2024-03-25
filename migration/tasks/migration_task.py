from prefect import flow,task

@task
def migration_task():
    msg = 'Hello from Task'
    return msg
