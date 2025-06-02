#!/bin/bash

pkill -f node                              
pkill -f uvicorn
pkill -f python

MODE=${1:-development}
export NODE_ENV=$MODE
echo "🛠️ Running in $NODE_ENV mode..."

echo "Starting all services..."

# Start editingModel
cd editingModel
bash build.sh
bash start.sh &
cd ..

# Start biasAnalyse without Docker
cd biasAnalyse
bash start.sh &
cd ..

# Start mainEndpoint
cd mainEndpoint
pip install google-cloud-storage
pip install -r requirements.txt
npm install dotenv
bash start.sh &
cd ..

# editingModel
echo "⏳ Waiting for editingModel (8000)..."
while ! nc -z localhost 8000; do sleep 1; done
echo "✅ editingModel is ready."

# biasAnalyse (already good)
echo "⏳ Waiting for biasAnalyse (8005)..."
while ! nc -z localhost 8005; do sleep 1; done
echo "✅ biasAnalyse is ready."

# mainEndpoint
echo "⏳ Waiting for mainEndpoint (5001)..."
while ! nc -z localhost 5001; do sleep 1; done
echo "✅ mainEndpoint is ready."

# Start frontend
cd frontend
rm -rf node_modules package-lock.json yarn.lock
npm install
npm install react react-dom react-icons
npm install react-responsive-carousel
chmod +x node_modules/.bin/vite
npm run dev &

echo "🎉 All services are up! Frontend is running."