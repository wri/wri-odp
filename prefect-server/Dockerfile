FROM prefecthq/prefect:2.11.5-python3.11

WORKDIR /app
# Copy all jobs to container
COPY jobs .
COPY entrypoint.sh .
# Install dependencies for datapusher
RUN pip3 install -r datapusher/requirements.txt
RUN cp datapusher/datapusher.service /etc/systemd/system/datapusher.service

ENTRYPOINT ["/bin/bash"]
CMD ["entrypoint.sh"]
