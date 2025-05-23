#!/usr/bin/env bash
set -euo pipefail

API=http://127.0.0.1:8000
OUT_FILE=test_response_bias.json

# Run the analysis synchronously, save to file, and echo to console
curl -s -X POST "$API/analyze_bias" \
     -H "Content-Type: application/json" \
     -d @test_payload_bias.json \
  | tee "$OUT_FILE"
