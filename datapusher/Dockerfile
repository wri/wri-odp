FROM prefecthq/prefect:2.14.5-python3.11

WORKDIR /app
# Copy all jobs to container
COPY . .
RUN pip3 install -r requirements.txt
RUN apt-get update
RUN apt-get install -y curl

CMD [ "python", "main.py" ]
