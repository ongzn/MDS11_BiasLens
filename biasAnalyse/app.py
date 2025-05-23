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


class OriginalImage(BaseModel):
    name: str = Field(..., description="Filename of the original image")
    url: HttpUrl = Field(..., description="Public URL to download the original image")

class TransformImage(BaseModel):
    original: str = Field(..., description="Filename of the source image (e.g. '9568.jpg')")
    url: HttpUrl = Field(..., description="URL of the transformed image")

class TransformGroup(BaseModel):
    occupation: str
    images: List[TransformImage]

class AnalyzeRequest(BaseModel):
    gender: str
    age: str
    race: str
    num: int
    originals: List[OriginalImage]
    transform: List[TransformGroup]
    occupation: List[str]
    
class FaceCheckRequest(BaseModel):
    images: List[OriginalImage] 

# In-memory job store for demo purposes
jobs = {}


def process_job(job_id: str, payload: AnalyzeRequest):
    """
    Executes steps 3–6:
      Face++ extraction
      Per-image metric computation
      Aggregation across occupations
      Bias analysis & summary
    """
    print(f"Processing data for job id {job_id}")
    base_tmp = os.getenv("BASE_TMP", "/tmp")
    # Ensure directories exist
    dirs = [
        os.path.join(base_tmp, job_id, sub)
        for sub in ("facepp/originals", "facepp/transforms", "metrics", "consolidated", "bias")
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

    # Step 3: Face++ extraction
    client = FaceppClient()
    batches = []
    
    # Originals
    for img in payload.originals:
        url_str = str(img.url)
        base = os.path.splitext(img.name)[0]
        tag = f"orig-{base}"
        batches.append((tag, url_str))
        
    # Transforms
    for grp in payload.transform:
        occ = grp.occupation
        for ti in grp.images:
            url_str = str(ti.url)
            base = os.path.splitext(ti.original)[0]
            tag = f"{occ}-{base}"
            batches.append((tag, url_str))
    results = client.detect_batch(batches)
    
    # Persist Face++ JSONs
    for tag, data in results.items():
        if tag.startswith("orig-"):
            folder = os.path.join(base_tmp, job_id, "facepp/originals")
        else:
            occ = tag.split('-', 1)[0]
            folder = os.path.join(base_tmp, job_id, f"facepp/transforms/{occ}")
        os.makedirs(folder, exist_ok=True)
        with open(os.path.join(folder, f"{tag}.json"), "w") as f:
            f.write(json.dumps(data))
            
    jobs[job_id]["status"] = "facepp_extracted"
    print("Facepp Performed")
    
    images_root       = os.path.join(base_tmp, job_id, "images")
    orig_images_dir   = os.path.join(images_root, "originals")
    trans_images_root = os.path.join(images_root, "transforms")

    os.makedirs(orig_images_dir,   exist_ok=True)
    os.makedirs(trans_images_root, exist_ok=True)

    # 1) Originals
    for img in payload.originals:
        url  = str(img.url)
        dest = os.path.join(orig_images_dir, img.name)
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        with open(dest, "wb") as f:
            f.write(resp.content)

    # 2) Transforms (use the 'url' on each transform.images entry)
    for grp in payload.transform:
        occ_dir = os.path.join(trans_images_root, grp.occupation)
        os.makedirs(occ_dir, exist_ok=True)
        for ti in grp.images:
            url  = str(ti.url)
            # ti.original is the source filename, e.g. "9568.jpg"
            dest = os.path.join(occ_dir, ti.original)
            resp = requests.get(url, timeout=10)
            resp.raise_for_status()
            with open(dest, "wb") as f:
                f.write(resp.content)

    jobs[job_id]["images_downloaded"] = True
    print("Images Downloaded")
    
    skin_analyzer = SkinAnalyzer(job_id, base_tmp)
    skin_map = skin_analyzer.analyze()
    print(skin_map)
    jobs[job_id]["skin"] = skin_map
    jobs[job_id]["status"] = "skin_analyzed"
    print("Skin Analysis Performed")

    # Step 4: Metrics
    calculator = MetricCalculator(job_id, base_tmp, skin_map=skin_map)
    metrics_map = calculator.compute()
    jobs[job_id]["metrics"] = metrics_map
    jobs[job_id]["status"] = "metrics_computed"
    print("Metrics Computed")


    # Step 5: Aggregation
    aggregator = Aggregator(job_id, base_tmp)
    consolidated_map = aggregator.aggregate()
    jobs[job_id]["consolidated"] = consolidated_map
    jobs[job_id]["status"] = "aggregated"
    print("Aggregation Computed")

    # Step 6: Bias Analysis
    attribute_name = f"{payload.gender}_{payload.age}_{payload.race}"
    analyzer = BiasAnalyzer(job_id, base_tmp)
    bias_map = analyzer.analyze(attribute_name)
    jobs[job_id]["bias"] = bias_map
    jobs[job_id]["status"] = "bias_analyzed"
    
    print(f"Data processed successfully!")


@app.post("/analyze_bias", status_code=202)
def analyze_bias(payload: AnalyzeRequest):
    # 1) Validate counts
    if len(payload.originals) != payload.num:
        raise HTTPException(400, detail="`originals` length does not match `num`")
    for grp in payload.transform:
        if len(grp.images) != payload.num:
            raise HTTPException(400, detail=f"In occupation '{grp.occupation}', images length != num")

    # 2) Run the full pipeline inline
    job_id = str(uuid.uuid4())
    jobs[job_id] = {"status": "queued", "request": payload.dict()}
    process_job(job_id, payload)

    # 3) Build and return the final JSON exactly as in GET /jobs/{job_id}
    job = jobs[job_id]
    if job.get("status") != "bias_analyzed":
        raise HTTPException(500, detail="Processing failed")

    response = {"job_id": job_id, "status": "bias_analyzed"}

    # echo back the input links
    response["originals"]   = job["request"]["originals"]
    response["transform"]   = job["request"]["transform"]

    # Per-occupation metrics
    metrics_data = {}
    for occ, path in job["metrics"].items():
        df = pd.read_csv(path)
        metrics_data[occ] = df.to_dict(orient='records')
    response["metrics"] = metrics_data

    # Consolidated tables
    consolidated_data = {}
    for name, path in job["consolidated"].items():
        df = pd.read_csv(path, index_col=0)
        consolidated_data[name] = [
            {**{"image_name": idx}, **row.to_dict()}
            for idx, row in df.iterrows()
        ]
    response["consolidated"] = consolidated_data

    # Bias summary (now includes race_bias) 
    summary_df = pd.read_csv(job["bias"]["summary"])
    response["bias_summary"] = summary_df.to_dict(orient='records')[0]

    # Age & gender matrices
    age_df    = pd.read_csv(job["bias"]["age_matrix"],    index_col=0)
    gender_df = pd.read_csv(job["bias"]["gender_matrix"], index_col=0)
    response["age_bias_matrix"] = [
        {**{"image_name": idx}, **row.to_dict()}
        for idx, row in age_df.iterrows()
    ]
    response["gender_bias_matrix"] = [
        {**{"image_name": idx}, **row.to_dict()}
        for idx, row in gender_df.iterrows()
    ]

    # ─── COMMENT: Race (skin‐darkness) matrix ───
    race_df = pd.read_csv(job["bias"]["race_matrix"], index_col=0)            # COMMENT
    response["race_bias_matrix"] = [                                          # COMMENT
        {**{"image_name": idx}, **row.to_dict()}                              # COMMENT
        for idx, row in race_df.iterrows()                                    # COMMENT
    ]                                                                         # COMMENT

    # Optionally clean up in-memory state
    del jobs[job_id]

    # sanitize NaNs → null
    import math
    def sanitize(v):
        if isinstance(v, float) and math.isnan(v):
            return None
        if isinstance(v, dict):
            return {k: sanitize(val) for k, val in v.items()}
        if isinstance(v, list):
            return [sanitize(val) for val in v]
        return v

    response = sanitize(response)
    return response

@app.post("/check_faces")
async def check_faces(payload: FaceCheckRequest):
    client = FaceppClient()

    # COMMENT: build batch using img.name as tag so we can map back
    batches = [(img.name, str(img.url)) for img in payload.images]

    results = client.detect_batch(batches)

    # COMMENT: iterate original payload.images to preserve name/url fields
    return [
        {
            "name": img.name,                             # COMMENT: include filename
            "url":  img.url,                              # COMMENT: include the original URL
            "has_face": bool(results.get(img.name, {}).get("faces"))  # COMMENT: face presence
        }
        for img in payload.images
    ]