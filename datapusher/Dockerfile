FROM prefecthq/prefect:2.14.5-python3.11

WORKDIR /app
# Copy all jobs to container
COPY . .
RUN rm .env
RUN pip3 install -r requirements.txt
RUN apt-get update

# Get Ubuntu packages
RUN apt-get install -y \
    build-essential \
    curl \
    file \
    uchardet \
    libuchardet-dev

# Install QSVDP
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN cargo install qsv --locked --bin qsvdp -F datapusher_plus,luau
RUN mkdir /app/files

CMD [ "python", "main.py" ]
