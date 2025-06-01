# FastAPI Image-Transformation Service

This repository contains a FastAPI application that provides three image‐editing endpoints (Pix2Pix, Img2Img, MagicBrush) by leveraging Hugging Face Diffusers pipelines. After performing the transformation, each edited image is uploaded to Firebase Storage and the public URL is returned.

---

## Table of Contents

1. [Prerequisites](#prerequisites)  
2. [Installation](#installation)  
3. [Environment & Configuration](#environment--configuration)  
4. [Available Endpoints](#available-endpoints)  
5. [Usage Examples](#usage-examples)  
6. [Running Locally](#running-locally)  
7. [Folder Structure](#folder-structure)  

---

## Prerequisites

- **Python ≥ 3.9** (tested on 3.10+)
- A **Firebase service account key** JSON file
- A valid **Hugging Face API token** (for model authorization)
- A machine with a **CUDA-capable GPU** (optional but strongly recommended for performance)
- Network access to Firebase and Hugging Face endpoints

---

## Installation

1. **Clone this repo** (or copy files into your project folder):
   ```bash
   git https://github.com/ongzn/MDS11_BiasLens.git
   cd editingModel
   ```

2. **Install Python dependencies**:
   ```bash
   ./build.sh
   ```
   - (This script upgrades pip and installs everything in `requirements.txt`.)

---

## Environment & Configuration

1. **`.env` file**  
   Create a file named `.env` in the project root (same folder as `main.py`) containing at least:
   ```ini
   HF_TOKEN=<your-huggingface-token>
   FIREBASE_KEY_PATH=/absolute/path/to/your/firebase-service-account.json
   ```
   - `HF_TOKEN` – Your Hugging Face access token (so diffusers pipelines can download model weights).
   - `FIREBASE_KEY_PATH` – Absolute filesystem path to your Firebase service account JSON. Example:
     ```
     FIREBASE_KEY_PATH=/home/username/config/firebase-key.json
     ```

2. **Firebase Storage**  
   - Make sure you have created a Firebase project and enabled a Storage bucket.
   - Your service account JSON (downloaded from Firebase Console → “Settings → Service Accounts → Generate new private key”) must live at the path specified by `FIREBASE_KEY_PATH`.
   - The code initializes Firebase with:
     ```python
     cred = credentials.Certificate(FIREBASE_KEY_PATH)
     firebase_admin.initialize_app(cred, { "storageBucket": "mds11-ee45b.firebasestorage.app" })
     ```
     Adjust the bucket name if yours differs from `mds11-ee45b.firebasestorage.app`.

---

## Available Endpoints

All endpoints accept and return JSON. By default, the server listens on port 8000.

### 1. `GET /`

- **Purpose**: Health check / basic info  
- **Response** (200 OK):  
  ```json
  { "message": "FastAPI Image-Transformation Service is running." }
  ```

---

### 2. `POST /transform-image`  (Pix2Pix)

- **Purpose**: Apply a Pix2Pix‐style transformation to a single image based on an occupation prompt, then upload the result to Firebase.  
- **Request Body**:
  ```json
  {
    "occupation": "nurse",
    "images": {
      "name": "original.png",
      "url":  "https://example.com/path/to/original.png"
    }
  }
  ```
  - `occupation` – A plain‐English string (e.g., `"engineer"`, `"chef"`, `"pilot"`) that will be appended to the prefix `"A photo of a {occupation}"` when running the Pix2Pix pipeline.
  - `images.name` – Client‐defined filename (not used internally, but returned in the response for reference).
  - `images.url` – Public URL (or accessible HTTPS URL) pointing to the original image. The service downloads this URL before processing.

- **Success Response** (200 OK):
  ```json
  {
    "transform": {
      "occupation": "nurse",
      "images": {
        "original": "https://example.com/path/to/original.png",
        "url":      "https://storage.googleapis.com/mds11-ee45b.firebasestorage.app/abcdef12-3456-7890-abcd-ef1234567890.png"
      }
    }
  }
  ```
  - `transform.occupation` – Echoes back the occupation.
  - `transform.images.original` – The same URL you supplied.
  - `transform.images.url` – Public Firebase URL of the Pix2Pix‐edited image.

- **Error Responses**:
  - `400 Bad Request` if the original image download fails (invalid URL or unreachable).
  - `500 Internal Server Error` if any pipeline error or Firebase upload fails.

---

### 3. `POST /transform-img2img`  (Img2Img)

- **Purpose**: Resize the original image to 384×384, apply an Img2Img transformation (again using `"A photo of a {occupation}"`), and upload the result to Firebase.  
- **Request Body**: Same schema as `/transform-image`.  
- **Success Response** (200 OK):  
  ```json
  {
    "transform": {
      "occupation": "chef",
      "images": {
        "original": "https://example.com/path/to/original.png",
        "url":      "https://storage.googleapis.com/mds11-ee45b.firebasestorage.app/12345678-abcd-1234-efgh-567890abcdef.png"
      }
    }
  }
  ```
- **Error Responses**:  
  - `400 Bad Request` if the original image fails to download or resize.  
  - `500 Internal Server Error` if diffusion pipeline or Firebase upload fails.

---

### 4. `POST /transform-magicbrush`  (MagicBrush)

- **Purpose**: Run the “MagicBrush” pipeline (similar to Pix2Pix but with a different set of model weights & hyperparameters), then upload the edited image to Firebase.  
- **Request Body**: Same schema as `/transform-image`.  
- **Success Response** (200 OK):
  ```json
  {
    "transform": {
      "occupation": "pilot",
      "images": {
        "original": "https://example.com/path/to/original.png",
        "url":      "https://storage.googleapis.com/mds11-ee45b.firebasestorage.app/0987fedc-ba65-4321-cb10-fedcba987654.png"
      }
    }
  }
  ```
- **Error Responses**:  
  - `400 Bad Request` if download fails.  
  - `500 Internal Server Error` if the MagicBrush pipeline or Firebase upload fails.

---

## Usage Examples

Below are curl examples for each endpoint. Replace placeholder values accordingly.

1. **Health Check**  
   ```bash
   curl http://localhost:8000/
   ```
   Expected response:
   ```json
   { "message": "FastAPI Image-Transformation Service is running." }
   ```

2. **Pix2Pix Transformation**  
   ```bash
   curl -X POST http://localhost:8000/transform-image      -H "Content-Type: application/json"      -d '{
           "occupation": "nurse",
           "images": {
             "name": "face1.png",
             "url":  "https://your-bucket/originals/face1.png"
           }
         }'
   ```
   On success, you’ll get a JSON object with the new Firebase‐hosted image URL.

3. **Img2Img Transformation**  
   ```bash
   curl -X POST http://localhost:8000/transform-img2img      -H "Content-Type: application/json"      -d '{
           "occupation": "chef",
           "images": {
             "name": "face2.jpg",
             "url":  "https://your-bucket/originals/face2.jpg"
           }
         }'
   ```

4. **MagicBrush Transformation**  
   ```bash
   curl -X POST http://localhost:8000/transform-magicbrush      -H "Content-Type: application/json"      -d '{
           "occupation": "pilot",
           "images": {
             "name": "face3.png",
             "url":  "https://your-bucket/originals/face3.png"
           }
         }'
   ```

---

## Running Locally

1. Ensure your `.env` is set up with:
   ```ini
   HF_TOKEN=<your-huggingface-token>
   FIREBASE_KEY_PATH=/absolute/path/to/firebase-key.json
   ```

2. **Install dependencies** (if you haven’t yet):
   ```bash
   ./build.sh
   ```

3. **Start the FastAPI server**:
   ```bash
   ./start.sh
   ```
   - This executes:
     ```
     uvicorn main:app --host 0.0.0.0 --port 8000
     ```
   - By default, Uvicorn will watch `main.py` and reload on code changes (if you run with `--reload`; you can add that flag manually for development).

4. The service is now listening on `http://localhost:8000`. You can hit the endpoints described above.

---

## Folder Structure

```
/
├─ main.py             # FastAPI application
├─ requirements.txt    # Python dependencies
├─ build.sh            # Installs requirements via pip
├─ start.sh            # Launches Uvicorn on main:app
├─ .env                # (Not checked in) Contains HF_TOKEN & FIREBASE_KEY_PATH
├─ /firebase           # (Optional) Your Firebase service account JSON can live here, 
│    └─ firebase-key.json
└─ …                   # Any other helper scripts or folders you add
```

---

## Notes & Tips

- **GPU Usage**  
  - The Hugging Face Diffusers pipelines (`Pix2Pix`, `Img2Img`, `MagicBrush`) will attempt to use a GPU if available. If you run on a CPU‐only machine, inference may be very slow—consider using a CUDA-enabled device or a cloud GPU VM.

- **Concurrency Control**  
  - The code uses `asyncio.Semaphore` to limit concurrent calls to each pipeline (so you don’t overload GPU memory). You can adjust the semaphore counts in `main.py` if you need more parallelism.

- **Logging & Debugging**  
  - Print statements show when each pipeline starts/finishes. If a transformation fails, you’ll see a “❌” log with the exception details.

- **Securing Firebase**  
  - This code makes uploaded images public by default. If you require stricter security, update your Firebase Storage rules or modify the `upload_to_firebase()` helper in `main.py` to generate signed URLs or keep files private.

- **Extending Endpoints**  
  - A commented‐out skeleton exists for a “DiffEdit” endpoint. To enable it, uncomment and fill in the missing lines (similar to the other three).  
  - You are free to add new pipelines—just follow the `TransformRequest` model and return the same JSON schema:
    ```json
    {
      "transform": {
        "occupation": "...",
        "images": {
          "original": "...",
          "url":      "..."
        }
      }
    }
    ```

- **Deploying to Production**  
  - Consider running Uvicorn (or Gunicorn + Uvicorn workers) behind a production web server (NGINX) and setting `--workers` to match your CPU/GPU count.
  - Make sure your `.env` and service account JSON are securely stored (not in Git).

You now have all the information needed to install, configure, and run this FastAPI image‐transformation service. 