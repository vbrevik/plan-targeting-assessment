FROM debian:bookworm-slim AS builder
WORKDIR /usr/src/backend

# Install build dependencies and rustup (use nightly toolchain to support edition2024)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl build-essential ca-certificates pkg-config libssl-dev git && \
    rm -rf /var/lib/apt/lists/*

ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH

# Install rustup and set nightly as default to support newer Cargo features
RUN curl https://sh.rustup.rs -sSf | sh -s -- -y --default-toolchain nightly && \
    rustup --version && cargo --version

# Copy project files
COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY migrations ./migrations
COPY scripts ./scripts
COPY data ./data
COPY config ./config
COPY keys ./keys

# Build release binary
RUN cargo build --release

FROM debian:bookworm-slim AS runtime
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy binary and data from builder
COPY --from=builder /usr/src/backend/target/release/template-repo-backend /usr/local/bin/template-repo-backend
COPY --from=builder /usr/src/backend/data ./data
COPY --from=builder /usr/src/backend/config ./config
COPY --from=builder /usr/src/backend/keys ./keys

# Create entrypoint script to ensure data directory exists and is writable
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'set -e' >> /app/entrypoint.sh && \
    echo 'mkdir -p /app/data' >> /app/entrypoint.sh && \
    echo 'chmod 777 /app/data 2>/dev/null || true' >> /app/entrypoint.sh && \
    echo 'exec /usr/local/bin/template-repo-backend' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

EXPOSE 3000
ENV RUST_LOG=info

# Run as root for development (simpler permissions with mounted volumes)
CMD ["/app/entrypoint.sh"]


