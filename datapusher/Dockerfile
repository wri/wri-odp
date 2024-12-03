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

# Install QSVDP
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"
RUN rustup install 1.75.0
RUN rustup default 1.75.0
RUN cargo install --version 0.108.0 qsv --locked --bin qsvdp -F datapusher_plus,luau
RUN mkdir /app/files

CMD [ "python", "main.py" ]
