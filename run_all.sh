#!/bin/bash

MODE=${1:-development}
export NODE_ENV=$MODE
echo "🛠️ Running in $NODE_ENV mode..."

echo "Starting all services..."

# Start editingModel
cd editingModel
bash build.sh
bash start.sh &
cd ..

# Start biasAnalyse (Docker)
cd biasAnalyse
docker build -t bias-analyse .
docker run -d -p 8002:8000 bias-analyse
cd ..

# Start mainEndpoint
cd mainEndpoint
pip install -r requirements.txt
npm install dotenv
bash start.sh &
cd ..

# Wait for editingModel (port 8001)
echo "⏳ Waiting for editingModel (8001)..."
while ! nc -z localhost 8001; do sleep 1; done
echo "✅ editingModel is ready."

# Wait for biasAnalyse (port 8002)
echo "⏳ Waiting for biasAnalyse (8002)..."
while ! nc -z localhost 8002; do sleep 1; done
echo "✅ biasAnalyse is ready."

# Wait for mainEndpoint (port 8000)
echo "⏳ Waiting for mainEndpoint (8000)..."
while ! nc -z localhost 8000; do sleep 1; done
echo "✅ mainEndpoint is ready."

# Start frontend
cd frontend
npm install
npm run dev &

echo "🎉 All services are up! Frontend is running."