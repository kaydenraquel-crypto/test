# NovaSignal Frontend Dockerfile
# Multi-stage build for optimized production image

# ============================================================================
# Stage 1: Build Environment
# ============================================================================
FROM node:18-alpine AS builder

LABEL maintainer="NovaSignal Team"
LABEL description="NovaSignal Trading Platform Frontend"

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production --ignore-scripts \
    && npm cache clean --force

# Copy source code
COPY . .

# Build arguments
ARG NODE_ENV=production
ARG VITE_API_BASE_URL=https://api.novasignal.com
ARG VITE_WS_BASE_URL=wss://api.novasignal.com/ws
ARG VITE_APP_VERSION=latest

# Set environment variables
ENV NODE_ENV=$NODE_ENV
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_BASE_URL=$VITE_WS_BASE_URL
ENV VITE_APP_VERSION=$VITE_APP_VERSION

# Build the application
RUN npm run build

# ============================================================================
# Stage 2: Production Environment
# ============================================================================
FROM nginx:1.25-alpine AS production

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S novasignal \
    && adduser -S novasignal -u 1001 -G novasignal

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Create nginx cache directories with proper permissions
RUN mkdir -p /var/cache/nginx/client_temp \
    && mkdir -p /var/cache/nginx/proxy_temp \
    && mkdir -p /var/cache/nginx/fastcgi_temp \
    && mkdir -p /var/cache/nginx/uwsgi_temp \
    && mkdir -p /var/cache/nginx/scgi_temp \
    && mkdir -p /var/log/nginx \
    && mkdir -p /var/run \
    && chown -R novasignal:novasignal /var/cache/nginx \
    && chown -R novasignal:novasignal /var/log/nginx \
    && chown -R novasignal:novasignal /var/run \
    && chown -R novasignal:novasignal /usr/share/nginx/html \
    && chmod -R 755 /usr/share/nginx/html

# Health check script
COPY healthcheck.sh /usr/local/bin/healthcheck.sh
RUN chmod +x /usr/local/bin/healthcheck.sh

# Switch to non-root user
USER novasignal

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD /usr/local/bin/healthcheck.sh

# Labels for metadata
LABEL org.opencontainers.image.title="NovaSignal Frontend"
LABEL org.opencontainers.image.description="Professional trading platform frontend"
LABEL org.opencontainers.image.version=$VITE_APP_VERSION
LABEL org.opencontainers.image.vendor="NovaSignal"
LABEL org.opencontainers.image.licenses="MIT"

# Start nginx
CMD ["nginx", "-g", "daemon off;"]