FROM python:3.14-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    file \
    uchardet \
    libuchardet-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy all jobs to container
COPY . .
RUN pip3 install -r requirements.txt

RUN mkdir /app/flow_logs

COPY files/datasets.csv /app/files/datasets.csv

CMD [ "python", "main.py" ]
