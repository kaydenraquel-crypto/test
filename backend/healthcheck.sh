#!/bin/bash
# NovaSignal Backend Health Check Script

set -e

# Function to check if service is responding
check_service() {
    local url="$1"
    local expected_status="${2:-200}"
    
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$status_code" != "$expected_status" ]; then
        echo "ERROR: $url returned status $status_code, expected $expected_status"
        return 1
    fi
    
    return 0
}

# Check main health endpoint
if ! check_service "http://localhost:8000/health" 200; then
    echo "ERROR: Main health check failed"
    exit 1
fi

# Check API health endpoint
if ! check_service "http://localhost:8000/api/health" 200; then
    echo "ERROR: API health check failed"
    exit 1
fi

# Check if the application can connect to external services (basic test)
if ! check_service "http://localhost:8000/api/status" 200; then
    echo "WARNING: Status endpoint not responding (may be normal during startup)"
fi

# Check memory usage (basic check)
memory_usage=$(python3 -c "
import psutil
import os
process = psutil.Process(os.getppid())
memory_percent = process.memory_percent()
if memory_percent > 90:
    print(f'HIGH_MEMORY: {memory_percent:.2f}%')
    exit(1)
else:
    print(f'MEMORY_OK: {memory_percent:.2f}%')
" 2>/dev/null || echo "MEMORY_CHECK_FAILED")

if [[ "$memory_usage" == HIGH_MEMORY* ]]; then
    echo "WARNING: $memory_usage"
fi

echo "Backend health check passed - $memory_usage"
exit 0