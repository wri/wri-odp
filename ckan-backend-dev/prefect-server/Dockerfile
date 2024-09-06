FROM prefecthq/prefect:2.14.5-python3.11

RUN apt-get update && apt-get install -y wget 

CMD ["/opt/prefect/entrypoint.sh", "prefect", "server", "start"]
