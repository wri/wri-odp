FROM prefecthq/prefect:2.14.5-python3.11

WORKDIR /app
# Copy all jobs to container
COPY . .
RUN pip3 install -r requirements.txt
RUN apt-get update

# Get Ubuntu packages
RUN apt-get install -y \
    build-essential \
    curl \
    file \
    uchardet \
    libuchardet-dev

RUN mkdir /app/flow_logs

COPY files/datasets.csv /app/files/datasets.csv

CMD [ "python", "main.py" ]
