#!/bin/bash

# Configuration
API_URL="http://localhost:3001/api/jobs/upload"
ROOT_URL="https://babus.ch"
FILE_PATH="/Users/brendanmarry/My Personal Google Drive/Awesome Ideas/withWilma/clients/babus/JDs/Assistant cook - Babu's.pdf"

# Check if file exists
if [ ! -f "$FILE_PATH" ]; then
    echo "Error: File not found at $FILE_PATH"
    exit 1
fi

echo "Uploading $FILE_PATH to $API_URL..."

# Upload using curl
RESPONSE=$(curl -s -X POST "$API_URL" \
  -F "rootUrl=$ROOT_URL" \
  -F "files=@$FILE_PATH")

echo "Response:"
echo "$RESPONSE"

# Extract Job ID (simple grep/sed, ideally use jq)
JOB_ID=$(echo "$RESPONSE" | grep -o '"createdJobs":\["[^"]*"' | sed 's/"createdJobs":\["//')

if [ -n "$JOB_ID" ]; then
    echo ""
    echo "✅ Job Created! ID: $JOB_ID"
    echo "Verify Layout at: http://localhost:3000/apply/$JOB_ID"
else
    echo ""
    echo "❌ Job creation failed or ID not found in response."
fi
