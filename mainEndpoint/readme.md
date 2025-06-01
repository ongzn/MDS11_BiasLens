# Backend API for Image Generation & Bias Analysis

This repository contains an Express.js backend that:
- Fetches and serves “original” face images stored in Firebase Storage.
- Proxies requests to a FastAPI-based image-transformation service (Pix2Pix, Img2Img, MagicBrush).
- Proxies bias-analysis requests to a separate bias-analysis endpoint.
- Accepts user-uploaded images and saves them to Firebase.

---

## Table of Contents

1. [Prerequisites](#prerequisites)  
2. [Installation](#installation)  
3. [Environment & Configuration](#environment--configuration)  
4. [Available Endpoints](#available-endpoints)  
5. [Running Locally](#running-locally)  
6. [Scripts](#scripts)  
7. [Folder Structure](#folder-structure)  

---

## Prerequisites

- **Node.js ≥ 16.x** and **npm (or Yarn)**  
- A **Firebase service account key** JSON file  
- A running FastAPI service (for image transforms) and a bias-analysis API  

---

## Installation

1. **Clone this repo** (or copy files into your project directory):
   ```bash
   git clone https://github.com/ongzn/MDS11_BiasLens.git
   cd mainEndpoint
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```
   or, if you prefer Yarn:
   ```bash
   yarn install
   ```

3. **Create a `config` directory** at the root of this project (if it doesn’t already exist).

4. **Place your Firebase service account JSON** in `config/firebase_key.json`.  
   - You can generate this from the Firebase Console under “Project Settings → Service Accounts → Generate new private key.”

5. **Create a `config/env.js` file** (to export your FastAPI & bias-analysis URLs).  
   ```js
   // config/env.js
   module.exports = {
     MODEL_ENDPOINT: "https://your-fastapi-host:8000",
     BIAS_ANALYSIS: "https://your-bias-api-host/endpoint"
   };
   ```
   Adjust these two properties to point at your deployed FastAPI image-transform service and your bias-analysis service.

6. **(Optional)** If you keep any additional secrets (e.g., custom Firebase variables), you can create a top-level `.env` file in the root. The code already runs `require("dotenv").config()`, so any `process.env.*` variables you add will be loaded automatically.

---

## Environment & Configuration

1. **`config/firebase_key.json`**  
   - Contains your Firebase service account credentials (JSON).  
   - Used by `firebase-admin` to authenticate and read/write to Firebase Storage.

2. **`config/env.js`**  
   - Exports two strings:
     - `MODEL_ENDPOINT`: Base URL of your FastAPI image-transform service (e.g., Pix2Pix, Img2Img, MagicBrush).
     - `BIAS_ANALYSIS`: URL of your bias-analysis endpoint (e.g., an Express/FastAPI server that evaluates demographic bias).

3. **`.env` (optional)**  
   - If you need to override or add any other environment variables (e.g., custom Firebase configs, API keys), drop them here.  
   - The code calls `require('dotenv').config()` at startup, so anything you export in `.env` will be in `process.env`.

---

## Available Endpoints

Below is a list of the REST endpoints this server exposes. All endpoints expect and return JSON.  

### 1. `/get-random-images`  `[POST]`  
Fetch a random set of face images from Firebase Storage under the `originals/` folder.  
- **Request Body** (JSON):
  ```json
  {
    "gender":   "Female",
    "age":      "20-29",
    "race":     "Black",
    "num":       5
  }
  ```
  - `gender`, `age`, `race` are used to build a folder path:  
    ```
    originals/{gender}_{age}_{race}/
    ```
    (spaces replaced with hyphens).  
  - `num` is how many random images to return.

- **Responses**:
  - `200 OK`  
    ```json
    {
      "images": [
        { "name": "img1.png", "url": "https://...signed-url..." },
        { "name": "img2.png", "url": "https://...signed-url..." },
        // up to `num` items
      ]
    }
    ```
  - `400 Bad Request` if any required field is missing.  
  - `404 Not Found` if no images are found in the specified folder.  
  - `500 Internal Server Error` on Firebase errors.

### 2. `/refresh-image`  `[POST]`  
Replace one image in the client’s current set with a new, random image from the same Firebase folder.
- **Request Body** (JSON):
  ```json
  {
    "images": [
      { "name": "img1.png", "url": "https://...signed-url..." },
      { "name": "img2.png", "url": "https://...signed-url..." }
      // the full current list of images on the client
    ],
    "replace": {
      "name": "img2.png",
      "url": "https://...signed-url..."
    }
  }
  ```
  - `images`: List of all currently displayed images (with their `name` fields).  
  - `replace`: The single image object the client wants to swap out (so the server can avoid re-sending the same file).

- **Responses**:
  - `200 OK`  
    ```json
    {
      "replacement": { "name": "newImg.png", "url": "https://...signed-url..." }
    }
    ```
  - `400 Bad Request` if either `images` or `replace` is missing/invalid.  
  - `404 Not Found` if there is no other image left in that folder to swap in.  
  - `500 Internal Server Error` on Firebase errors.

### 3. `/transform-image`  `[POST]`  
Proxy route to your FastAPI endpoint for Pix2Pix-style transformations.
- **Request Body**: Forwarded exactly to `{MODEL_ENDPOINT}/transform-image` (with JSON).  
- **Behavior**:  
  - The server relays your JSON body to the FastAPI service.  
  - On success, it returns the exact JSON response from FastAPI.  
  - On failure, it logs an error and returns the FastAPI error code & body.

### 4. `/transform-img2img`  `[POST]`  
Proxy route to your FastAPI endpoint for Img2Img transformations.
- **Request Body**: Forwarded exactly to `{MODEL_ENDPOINT}/transform-img2img` (with JSON).  
- **Behavior**: Same proxy logic as `/transform-image`.

### 5. `/transform-magicbrush`  `[POST]`  
Proxy route to your FastAPI endpoint for MagicBrush-style transformations.
- **Request Body**: Forwarded exactly to `{MODEL_ENDPOINT}/transform-magicbrush` (with JSON).  
- **Behavior**: Same proxy logic as above.

### 6. `/analyze-bias`  `[POST]`  
Proxy route to your bias-analysis service.
- **Request Body**: Forwarded exactly to the URL defined in `BIAS_API_URL`.  
- **Behavior**:  
  - Sends JSON payload to your bias-analysis endpoint.  
  - Returns whatever JSON that service responds with.  
  - On error, logs and returns the appropriate status & JSON.

### 7. `/upload-images`  `[POST]`  
Accepts Base64-encoded images from the client and saves them under `upload/` in Firebase Storage.
- **Request Body** (JSON):
  ```json
  {
    "images": [
      { "base64": "data:image/png;base64,iVBORw0KGgoAAAANS..." },
      { "base64": "data:image/jpeg;base64,/9j/4AAQ..." }
    ]
  }
  ```
  - Each element in `"images"` must be a valid data-URL string beginning with `"data:image/"`.

- **Behavior**:
  - Decodes each Base64 string and writes it to `upload/{uuid}.png` in Firebase Storage.  
  - Makes the saved file public, then returns its public URL.

- **Responses**:
  - `200 OK`  
    ```json
    {
      "uploaded": [
        { "name": "ae3f9f23-4e21-4b7c-90a7-2d8a9f1adc7a.png",
          "url":  "https://storage.googleapis.com/mds11-ee45b.firebasestorage.app/upload/ae3f9f23-4e21-4b7c-90a7-2d8a9f1adc7a.png"
        },
        // …
      ]
    }
    ```
  - `400 Bad Request` if `"images"` is missing or not an array, or if one of the entries isn’t a valid data-URL.  
  - `500 Internal Server Error` if the Firebase save fails.

---

## Running Locally

1. Make sure you have `config/firebase_key.json` and `config/env.js` properly configured (see above).

2. From the project root:
   ```bash
   # Development (auto-reload on changes via nodemon):
   npm run dev

   # Production (just run Node once):
   npm start
   ```

3. By default, the server will listen on port `5001`. You can override this by setting the `PORT` environment variable:
   ```bash
   PORT=8080 npm start
   ```

4. Once the server is running, you can test any endpoint with a tool like Postman, curl, or your React frontend.

---

## Scripts

- **`npm run dev`**  
  Launches `nodemon index.js`, watches for file changes, and restarts automatically.

- **`npm start`**  
  Launches `node index.js` in production mode.

---

## Folder Structure

```
/backend
│
├─ index.js                # Main Express server
├─ package.json            # Node dependencies & scripts
├─ package-lock.json
├─ requirements.txt        # (FastAPI service dependencies, if you run the Python side here)
├─ start.sh                # (Optional: a shell script you may use to launch both Node & FastAPI)
│
├─ /config
│   ├─ firebase_key.json    # Your Firebase service account (not checked into Git)
│   └─ env.js               # Exports MODEL_ENDPOINT & BIAS_ANALYSIS URLs
│
├─ /node_modules           # Installed Node packages
│
└─ (other helper files)
```

---

## Notes & Tips

- **Firebase Storage Rules**  
  Ensure that your Firebase Storage rules allow read access to `originals/…` and write access to `upload/…` for authenticated or public users (depending on your security needs).

- **CORS**  
  The server enables `cors()` globally, so your React frontend (or any other origin) can make AJAX requests without extra configuration.

- **Proxying**  
  - All image transformation calls (`/transform-image`, `/transform-img2img`, `/transform-magicbrush`) are proxied to whatever you set `MODEL_ENDPOINT` to in `config/env.js`.  
  - The bias-analysis call (`/analyze-bias`) is proxied to `BIAS_ANALYSIS`.

- **Error Handling**  
  - Each proxy endpoint catches errors, logs them to the console, and returns the same status code & JSON body if available.  
  - If no response is present on error, a generic `{ "error": "Internal proxy error" }` is returned with status 500.

- **Extending**  
  If you need more endpoints (e.g., additional FastAPI calls, or Firestore database reads/writes), simply register new routes in `index.js` and follow the existing pattern.

---

You should now have everything you need to set up and run the backend service locally. If you run into any permission issues or “missing file” errors, double-check that:

1. Your `config/firebase_key.json` exists and is valid.
2. You exported the correct FastAPI & bias-analysis URLs in `config/env.js`.
3. You ran `npm install` from the correct root folder (where `package.json` lives).

