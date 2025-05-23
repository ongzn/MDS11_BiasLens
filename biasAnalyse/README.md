# BiasPainter Backend Service

This is the backend service for the BiasPainter pipeline, implemented with FastAPI. It accepts a payload describing demographic groups and image URLs, runs a multi-step analysis (Face++ attribute extraction, metric computation, aggregation, and bias scoring), and returns structured results via HTTP.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Server](#running-the-server)
5. [API Endpoints](#api-endpoints)
6. [Testing](#testing)
7. [Directory Structure](#directory-structure)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

* **Python 3.8+**
* **pip** (or use a Conda environment)
* **Face++ API credentials** (key and secret)

---

## Installation

1. **Clone the repository** and navigate to the backend folder:

   ```bash
   git clone <your-repo-url>
   cd BiasPainter_Service
   ```

2. **Create a virtual environment** (recommended):

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

   If using Conda, you can alternatively:

   ```bash
   conda env create -f environment.yml
   conda activate <env-name>
   ```

---

## Configuration

1. Copy the example `.env`:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` and set your Face++ credentials:

   ```ini
   FACEPP_KEY=<your_facepp_api_key>
   FACEPP_SECRET=<your_facepp_api_secret>
   # Optional: override working directory
   BASE_TMP=/absolute/path/to/tmp
   ```

3. Ensure `.env` is ignored by Git (it is listed in `.gitignore`).

---

## Running the Server

Start the FastAPI development server with Uvicorn:

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

* The API will be available at `http://127.0.0.1:8000`.
* Swagger UI for interactive docs: `http://127.0.0.1:8000/docs`.

---

## API Endpoints

### `POST /analyze_bias`

* **Description**: Submit a bias-analysis job.
* **Request Body**: JSON matching the `AnalyzeRequest` schema:

  ```json
  {
    "gender": "Female",
    "age": "20-29",
    "race": "Black",
    "num": 2,
    "originals": [ { "name":"9568.jpg","url":"..." }, ... ],
    "transform": [
      { "occupation":"Nurse", "images":[{"original":"9568.jpg","url":"..."}, ...] },
      { "occupation":"Doctor", "images":[...] }
    ]
  }
  ```
* **Response**: `202 Accepted` with:

  ```json
  { "job_id": "<uuid>", "status": "queued" }
  ```

### `GET /jobs/{job_id}`

* **Description**: Check job status or retrieve results.
* **Path Parameter**: `job_id` (UUID returned from `POST /analyze_bias`).
* **Responses**:

  * **In Progress**:

    ```json
    { "job_id":"<uuid>", "status":"queued" }
    ```
  * **Completed** (`status: "bias_analyzed"`): full JSON including:

    * `metrics` per occupation
    * `consolidated` tables
    * `bias_summary`
    * `age_bias_matrix`, `gender_bias_matrix`

---

## Testing

A helper script `run_test.sh` automates submitting `test_payload.json` and saving the final response to `response.json`:

```bash
chmod +x run_test.sh
./run_test.sh
# Result is in response.json
```

---

## Directory Structure

```
BiasPainter_Service/
├── app.py                   # Main FastAPI application
├── metric_calculator.py     # Step 4: per-image metrics
├── aggregator.py            # Step 5: aggregation
├── bias_analyzer.py         # Step 6: bias computation
├── facepp_client.py         # Step 3: Face++ API client
├── run_test.sh              # Test script
├── requirements.txt
├── environment.yml
├── .env.example
└── README.md                # This file
```

---

## Troubleshooting

* **Port Already in Use**: specify a different port via `--port` flag or kill the existing process.
* **Missing Credentials**: ensure `.env` exists and is loaded (`python-dotenv`), env vars visible.
* **Permission Errors**: adjust `BASE_TMP` to a writable directory.
* **Face++ Rate Limits**: reduce batch size or implement backoff in `facepp_client.py`.

---
