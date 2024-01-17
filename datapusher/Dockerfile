FROM prefecthq/prefect:2.11.5-python3.11

WORKDIR /app
# Copy all jobs to container
COPY . .
RUN pip3 install -r requirements.txt

CMD [ "python", "main.py" ]
