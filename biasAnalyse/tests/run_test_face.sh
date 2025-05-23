#!/usr/bin/env bash
set -euo pipefail

API=http://127.0.0.1:8000
OUT_FILE=test_response_face.json

# Run the analysis synchronously, save to file, and echo to console
curl -s -X POST "$API/check_faces" \
     -H "Content-Type: application/json" \
     -d @test_payload_face.json \
  | tee "$OUT_FILE"
