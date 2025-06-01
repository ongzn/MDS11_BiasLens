#!/bin/bash

echo "🚀 Starting bias analysis module..."

# Detect OS and skip apt-get if not Linux
OS_TYPE=$(uname)
if [ "$OS_TYPE" = "Darwin" ]; then
  echo "🛑 Skipping apt-get install on macOS."
else
  echo "🔧 Updating system packages and installing build tools..."
  sudo apt-get update && sudo apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    libboost-all-dev \
    libgtk-3-dev \
    libgl1-mesa-glx
fi

echo "🗂️ Setting up application directory..."
cd "$(dirname "$0")" || exit
APP_DIR=$(pwd)
echo "Working directory: $APP_DIR"

echo "📦 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
pip install opencv-python
pip install mediapipe

echo "▶️ Starting FastAPI server on port 8005..."
uvicorn app:app --host 0.0.0.0 --port 8005