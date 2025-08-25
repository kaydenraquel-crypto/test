# NovaSignal Backend Dockerfile
# Multi-stage build for optimized production image

# ============================================================================
# Stage 1: Build Environment
# ============================================================================
FROM python:3.11-slim AS builder

LABEL maintainer="NovaSignal Team"
LABEL description="NovaSignal Trading Platform Backend"

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    POETRY_NO_INTERACTION=1 \
    POETRY_VENV_IN_PROJECT=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Poetry
RUN pip install poetry

# Set working directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml poetry.lock* ./

# Install Python dependencies
RUN poetry install --only=main --no-root && rm -rf $POETRY_CACHE_DIR

# ============================================================================
# Stage 2: Production Environment
# ============================================================================
FROM python:3.11-slim AS production

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user
RUN useradd --create-home --shell /bin/bash novasignal

# Set working directory
WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /app/.venv /app/.venv

# Copy application code
COPY . .

# Create necessary directories and set permissions
RUN mkdir -p /app/logs \
    && chown -R novasignal:novasignal /app \
    && chmod -R 755 /app

# Copy health check script
COPY healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# Switch to non-root user
USER novasignal

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# Build arguments
ARG APP_VERSION=latest
ARG BUILD_DATE
ARG GIT_COMMIT

# Labels for metadata
LABEL org.opencontainers.image.title="NovaSignal Backend"
LABEL org.opencontainers.image.description="Professional trading platform backend API"
LABEL org.opencontainers.image.version=$APP_VERSION
LABEL org.opencontainers.image.vendor="NovaSignal"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.created=$BUILD_DATE
LABEL org.opencontainers.image.revision=$GIT_COMMIT

# Start the application
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]