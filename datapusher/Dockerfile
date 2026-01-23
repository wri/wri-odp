FROM prefecthq/prefect:2.14.5-python3.11

WORKDIR /app

# 1. Install System Dependencies
# Combine update, install, and cleanup to keep the layer small and cached
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    file \
    uchardet \
    libuchardet-dev && \
    rm -rf /var/lib/apt/lists/*

# 2. Install Rust and QSV
# This is the heaviest step (compilation). We do it early so it's cached
# unless system deps change.
ENV PATH="/root/.cargo/bin:${PATH}"
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y && \
    rustup install 1.75.0 && \
    rustup default 1.75.0 && \
    cargo install --version 0.108.0 qsv --locked --bin qsvdp -F datapusher_plus,luau && \
    # Cleanup cargo registry to save space (optional, but good for final image size)
    rm -rf /root/.cargo/registry

# 3. Install Python Dependencies
# Copy ONLY requirements.txt first. This isolates the pip install cache
# from changes in your application code (main.py, tasks/, etc.)
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# 4. Copy Application Code
# This changes most frequently, so it goes last.
COPY . .

RUN mkdir -p /app/files

CMD [ "python", "main.py" ]
