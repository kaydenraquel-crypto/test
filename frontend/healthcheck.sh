#!/bin/sh
# NovaSignal Frontend Health Check Script

set -e

# Check if nginx is running
if ! pgrep nginx > /dev/null; then
    echo "ERROR: nginx is not running"
    exit 1
fi

# Check if the application responds
if ! curl -f -s -o /dev/null http://localhost:8080/health; then
    echo "ERROR: Application health check failed"
    exit 1
fi

# Check if main application loads
if ! curl -f -s -o /dev/null http://localhost:8080/; then
    echo "ERROR: Main application is not accessible"
    exit 1
fi

echo "Frontend health check passed"
exit 0