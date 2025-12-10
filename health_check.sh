#!/bin/bash

# healch_check.sh
# Checks availability of Wilma services

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

LOG_FILE="health_check.log"

log_status() {
    local service=$1
    local url=$2
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    # If domain not resolvable, try localhost ports as fallback if running on VPS
    if [ "$status_code" == "000" ]; then
        # Try local fallback mapping
        case $service in
            "Website") url="http://localhost:3002" ;;
            "Candidate App") url="http://localhost:3000" ;;
            "Recruiter App") url="http://localhost:3002/admin" ;;
            "Backend API") url="http://localhost:3001" ;;
        esac
        status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    fi

    if [[ "$status_code" =~ ^2 ]]; then
        echo -e "${GREEN}[OK]${NC} $service is UP ($url) - Status: $status_code"
        echo "$(date): $service UP ($status_code)" >> $LOG_FILE
    else
        echo -e "${RED}[ERR]${NC} $service is DOWN ($url) - Status: $status_code"
        echo "$(date): $service DOWN ($status_code)" >> $LOG_FILE
    fi
}

echo "=== Wilma Health Check $(date) ==="
echo "Checking services..."

log_status "Website" "http://withwilma.com"
log_status "Candidate App" "http://app.withwilma.com"
log_status "Recruiter App" "http://app.withwilma.com/admin"
log_status "Backend API" "http://api.withwilma.com"

echo "=== Check Complete ==="
