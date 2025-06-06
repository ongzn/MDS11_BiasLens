import os
import uuid
import json
import pandas as pd
import requests
import math
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl, Field
from typing import List
from facepp_client import FaceppClient
from skin_analyzer import SkinAnalyzer
from metric_calculator import MetricCalculator
from aggregator import Aggregator
from bias_analyzer import BiasAnalyzer
from dotenv import load_dotenv

# look for a .env in the same folder as this file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

app = FastAPI(title="Bias Analysis Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Allow *only* simple requests (no credentials)
    allow_credentials=False,  # <- turned off
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Request Schemas ----------

class OriginalImage(BaseModel):
    """Schema for a single original image"""
    name: str = Field(..., description="Filename of the original image")
    url: HttpUrl = Field(..., description="Public URL to download the original image")

class TransformImage(BaseModel):
    """Schema for each transformed image and its source filename"""
    original: str = Field(..., description="Filename of the source image (e.g. '9568.jpg')")
    url: HttpUrl = Field(..., description="URL of the transformed image")

class TransformGroup(BaseModel):
    """Schema for a group of transformed images under one occupation"""
    occupation: str
    images: List[TransformImage]

class AnalyzeRequest(BaseModel):
    """Schema for full bias analysis input"""
    gender: str
    age: str
    race: str
    num: int
    originals: List[OriginalImage]
    transform: List[TransformGroup]
    occupation: List[str]

class FaceCheckRequest(BaseModel):
    """Schema for checking if uploaded images contain faces"""
    images: List[OriginalImage] 

# ---------- In-memory Job Store ----------
jobs = {}

# ---------- Bias Analysis Core Pipeline ----------
def process_job(job_id: str, payload: AnalyzeRequest):
    """
    Runs the full bias analysis pipeline.
    Steps:
    1. Face++ feature extraction
    2. Download all input images (originals and transforms)
    3. Perform skin tone analysis
    4. Calculate image-based metrics
    5. Aggregate the results
    6. Analyze for demographic bias
    """
    print(f"Processing data for job id {job_id}")
    base_tmp = os.getenv("BASE_TMP", "/tmp")

    # Create necessary directories for intermediate results
    dirs = [
        os.path.join(base_tmp, job_id, sub)
        for sub in ("facepp/originals", "facepp/transforms", "metrics", "consolidated", "bias")
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

    # --- Step 1: Face++ feature extraction ---
    client = FaceppClient()
    batches = []

    # Build batch: original images
    for img in payload.originals:
        tag = f"orig-{os.path.splitext(img.name)[0]}"
        batches.append((tag, str(img.url)))

    # Build batch: transformed images
    for grp in payload.transform:
        for ti in grp.images:
            tag = f"{grp.occupation}-{os.path.splitext(ti.original)[0]}"
            batches.append((tag, str(ti.url)))

    results = client.detect_batch(batches)

    # Save Face++ responses into JSON files by tag
    for tag, data in results.items():
        folder = os.path.join(base_tmp, job_id, "facepp/originals" if tag.startswith("orig-") else f"facepp/transforms/{tag.split('-')[0]}")
        os.makedirs(folder, exist_ok=True)
        with open(os.path.join(folder, f"{tag}.json"), "w") as f:
            f.write(json.dumps(data))

    jobs[job_id]["status"] = "facepp_extracted"
    print("Facepp Performed")

    # --- Step 2: Download original and transformed images locally ---
    images_root       = os.path.join(base_tmp, job_id, "images")
    orig_images_dir   = os.path.join(images_root, "originals")
    trans_images_root = os.path.join(images_root, "transforms")
    os.makedirs(orig_images_dir, exist_ok=True)
    os.makedirs(trans_images_root, exist_ok=True)

    # Download original images
    for img in payload.originals:
        resp = requests.get(str(img.url), timeout=10)
        resp.raise_for_status()
        with open(os.path.join(orig_images_dir, img.name), "wb") as f:
            f.write(resp.content)

    # Download transformed images
    for grp in payload.transform:
        occ_dir = os.path.join(trans_images_root, grp.occupation)
        os.makedirs(occ_dir, exist_ok=True)
        for ti in grp.images:
            resp = requests.get(str(ti.url), timeout=10)
            resp.raise_for_status()
            with open(os.path.join(occ_dir, ti.original), "wb") as f:
                f.write(resp.content)

    jobs[job_id]["images_downloaded"] = True
    print("Images Downloaded")

    # --- Step 3: Skin tone analysis ---
    skin_map = SkinAnalyzer(job_id, base_tmp).analyze()
    jobs[job_id]["skin"] = skin_map
    jobs[job_id]["status"] = "skin_analyzed"
    print("Skin Analysis Performed")

    # --- Step 4: Metric calculation ---
    metrics_map = MetricCalculator(job_id, base_tmp, skin_map).compute()
    jobs[job_id]["metrics"] = metrics_map
    jobs[job_id]["status"] = "metrics_computed"
    print("Metrics Computed")

    # --- Step 5: Aggregation ---
    consolidated_map = Aggregator(job_id, base_tmp).aggregate()
    jobs[job_id]["consolidated"] = consolidated_map
    jobs[job_id]["status"] = "aggregated"
    print("Aggregation Computed")

    # --- Step 6: Bias analysis ---
    attribute_name = f"{payload.gender}_{payload.age}_{payload.race}"
    bias_map = BiasAnalyzer(job_id, base_tmp).analyze(attribute_name)
    jobs[job_id]["bias"] = bias_map
    jobs[job_id]["status"] = "bias_analyzed"
    print("Data processed successfully!")

# ---------- API Endpoint: Bias Analysis ----------
@app.post("/analyze_bias", status_code=202)
def analyze_bias(payload: AnalyzeRequest):
    """
    Accepts image and demographic data, runs full bias analysis, and returns metrics and summaries.
    """
    if len(payload.originals) != payload.num:
        raise HTTPException(400, detail="`originals` length does not match `num`")
    for grp in payload.transform:
        if len(grp.images) != payload.num:
            raise HTTPException(400, detail=f"In occupation '{grp.occupation}', images length != num")

    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "queued", "request": payload.dict()}
    process_job(job_id, payload)

    job = jobs[job_id]
    if job.get("status") != "bias_analyzed":
        raise HTTPException(500, detail="Processing failed")

    # Build response JSON
    response = {
        "job_id": job_id,
        "status": "bias_analyzed",
        "originals": job["request"]["originals"],
        "transform": job["request"]["transform"],
    }

    # Load per-image metrics
    metrics_data = {}
    for occ, path in job["metrics"].items():
        df = pd.read_csv(path)
        metrics_data[occ] = df.to_dict(orient='records')
    response["metrics"] = metrics_data

    # Load consolidated statistics
    consolidated_data = {}
    for name, path in job["consolidated"].items():
        df = pd.read_csv(path, index_col=0)
        consolidated_data[name] = [
            {**{"image_name": idx}, **row.to_dict()} for idx, row in df.iterrows()
        ]
    response["consolidated"] = consolidated_data

    # Load final bias results
    summary_df = pd.read_csv(job["bias"]["summary"])
    response["bias_summary"] = summary_df.to_dict(orient='records')[0]

    # Age, gender, race matrices
    for category in ["age", "gender", "race"]:
        df = pd.read_csv(job["bias"][f"{category}_matrix"], index_col=0)
        response[f"{category}_bias_matrix"] = [
            {**{"image_name": idx}, **row.to_dict()} for idx, row in df.iterrows()
        ]

    # Clean up memory
    del jobs[job_id]

    # Sanitize NaN to null
    def sanitize(v):
        if isinstance(v, float) and math.isnan(v): return None
        if isinstance(v, dict): return {k: sanitize(val) for k, val in v.items()}
        if isinstance(v, list): return [sanitize(val) for val in v]
        return v
    response = sanitize(response)

    # Count failed face detections for age
    failures = []
    for row in response.get("age_bias_matrix", []):
        for occ, val in row.items():
            if occ != "image_name" and val is None:
                failures.append({"image_name": row["image_name"], "occupation": occ})

    response["bias_failures"] = {
        "total_failed": len(failures),
        "details": failures
    }

    return response

# ---------- API Endpoint: Face Validation ----------
@app.post("/check_faces")
async def check_faces(payload: FaceCheckRequest):
    """
    Checks whether faces are detectable in a list of provided image URLs.
    """
    client = FaceppClient()
    batches = [(img.name, str(img.url)) for img in payload.images]
    results = client.detect_batch(batches)

    return [
        {
            "name": img.name,
            "url": img.url,
            "has_face": bool(results.get(img.name, {}).get("faces"))
        }
        for img in payload.images
    ]