#!/bin/bash

echo "▶️ Installing Python dependencies..."
pip install --upgrade pip

pip install -r requirements.txt
pip install google-cloud-storage
echo "✅ Dependencies installed."