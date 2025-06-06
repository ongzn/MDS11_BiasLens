# main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from PIL import Image
import requests, torch, uuid, os, json
from io import BytesIO
import asyncio
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()

# --- Hugging Face & DALL·E Mini ---
from huggingface_hub import login

# --- Diffusers imports ---
from diffusers import StableDiffusionInstructPix2PixPipeline, AutoPipelineForImage2Image, EulerAncestralDiscreteScheduler

# --- Firebase Admin SDK ---
import firebase_admin
from firebase_admin import credentials, storage

# Initialize FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables
HF_TOKEN = os.getenv("HF_TOKEN") 
FIREBASE_KEY_PATH = os.getenv("FIREBASE_KEY_PATH")

# Initialize Firebase
cred = credentials.Certificate(FIREBASE_KEY_PATH)
firebase_admin.initialize_app(cred, {'storageBucket': 'mds11-ee45b.firebasestorage.app'})
bucket = storage.bucket()
print("Firebase ready.")

# Setup model device
# device = "cuda" if torch.cuda.is_available() else "cpu" # Uncomment if CUDA supported
device = "cpu"  # Use CPU (e.g., for macOS)
login(HF_TOKEN)

# Load InstructPix2Pix pipeline
pix2pix = StableDiffusionInstructPix2PixPipeline.from_pretrained(
    "timbrooks/instruct-pix2pix",
    torch_dtype=torch.float32,
    safety_checker=None,
    low_cpu_mem_usage=True 
).to(device)
pix2pix.scheduler = EulerAncestralDiscreteScheduler.from_config(pix2pix.scheduler.config)
pix2pix.enable_attention_slicing()
print("Pix2Pix Pipeline ready.")

# Load Img2Img pipeline
img2img = AutoPipelineForImage2Image.from_pretrained(
    "kandinsky-community/kandinsky-2-2-decoder", 
    torch_dtype=torch.float32,
    use_safetensors=True
)
img2img.to(torch.device("cpu"))
img2img.enable_attention_slicing()
print("Img2Img Pipeline ready.")

# Load MagicBrush pipeline
magicbrush = StableDiffusionInstructPix2PixPipeline.from_pretrained(
    "vinesmsuic/magicbrush-jul7",
    torch_dtype=torch.float32,
    use_safetensors=False
).to(device)
magicbrush.scheduler = EulerAncestralDiscreteScheduler.from_config(magicbrush.scheduler.config)
magicbrush.enable_attention_slicing()
print("MagicBrush Pipeline ready.")

# Request data schemas
class ImageData(BaseModel):
    name: str
    url: str

class TransformRequest(BaseModel):
    occupation: str
    images: ImageData

# Helper to download image from a URL
def download_image(url):
    r = requests.get(url, stream=True)
    if r.status_code != 200:
        raise HTTPException(status_code=400, detail="Image download failed")
    return Image.open(r.raw).convert("RGB")

# Upload PIL image to Firebase and return public URL
def upload_to_firebase(image: Image.Image) -> str:
    buf = BytesIO()
    image.save(buf, format="PNG")
    buf.seek(0)
    filename = f"cache/{uuid.uuid4()}.png"
    blob = bucket.blob(filename)
    blob.upload_from_file(buf, content_type="image/png")
    blob.make_public()
    return blob.public_url

# Limit concurrent model executions
MAX_CONCURRENT_REQUESTS = 2
pix2pix_sem = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
img2img_sem = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)
magicbrush_sem = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

# Health check route
@app.get("/")
async def root():
    return {"message": "Pix2Pix + Img2Img API running"}

# Transform using InstructPix2Pix
@app.post("/transform-image")
async def transform_image(data: TransformRequest):
    async with pix2pix_sem:
        try:
            image = download_image(data.images.url)
            out = pix2pix(f"A photo of a {data.occupation}", image=image, num_inference_steps=10, image_guidance_scale=1).images[0]
            firebase_url = upload_to_firebase(out)
            return {
                "transform": {
                    "occupation": data.occupation,
                    "images": {"original": data.images.url, "url": firebase_url}
                }
            }
        except Exception as e:
            print(f"❌ [Pix2Pix] Failed transforming: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

# Transform using Img2Img
@app.post("/transform-img2img")
async def transform_img2img(data: TransformRequest):
    async with img2img_sem:
        try:
            print(f"▶️ [Img2Img] Start transforming for occupation: {data.occupation}")
            image = download_image(data.images.url).resize((384, 384))
            out = img2img(f"A photo of a {data.occupation}", image=image, strength=0.75, guidance_scale=1, num_inference_steps=10).images[0]
            firebase_url = upload_to_firebase(out)
            print(f"✅ [Img2Img] Done transforming: {firebase_url}")
            return {
                "transform": {
                    "occupation": data.occupation,
                    "images": {"original": data.images.url, "url": firebase_url}
                }
            }
        except Exception as e:
            print(f"❌ [Img2Img] Failed transforming: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

# Transform using MagicBrush
@app.post("/transform-magicbrush")
async def transform_magicbrush(data: TransformRequest):
    async with magicbrush_sem:
        try:
            print(f"▶️ [MagicBrush] Start transforming for occupation: {data.occupation}")
            image = download_image(data.images.url)
            out = magicbrush(f"A photo of a {data.occupation}", image=image, num_inference_steps=10, image_guidance_scale=1, guidance_scale=7, generator=torch.manual_seed(42)).images[0]
            firebase_url = upload_to_firebase(out)
            print(f"✅ [MagicBrush] Done transforming: {firebase_url}")
            return {
                "transform": {
                    "occupation": data.occupation,
                    "images": {"original": data.images.url, "url": firebase_url}
                }
            }
        except Exception as e:
            print(f"❌ [MagicBrush] Failed transforming: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

# Optional: DiffEdit route placeholder (currently disabled)
# diffedit_pipe = StableDiffusionDiffEditPipeline.from_pretrained(
#     "stabilityai/stable-diffusion-2-1", 
#     torch_dtype=torch.float16 if device == "cuda" else torch.float32,
#     use_safetensors=True
# ).to(device)

# diffedit_pipe.enable_attention_slicing()
# print("✅ DiffEdit Pipeline ready")

# @app.post("/transform-diffedit")
# async def transform_diffedit(data: TransformRequest):
#     async with diffedit_sem:
#         try:
#             print(f"▶️ [DiffEdit] Start transforming for occupation: {data.occupation}")

#             # Load and prepare image
#             image = download_image(data.images.url)
#             image = image.resize((768, 768))

#             # Generate mask based on the prompts
#             mask = diffedit_pipe.generate_mask(
#                 source_prompt="A photo of a person",
#                 target_prompt=f"A photo of a {data.occupation}",
#                 image=image
#             )

#             # Perform editing with mask
#             edited_image = diffedit_pipe(
#                 source_prompt="A photo of a person",
#                 target_prompt=f"A photo of a {data.occupation}",
#                 image=image,
#                 mask_image=mask,
#                 num_inference_steps=25,
#                 guidance_scale=7.5
#             ).images[0]

#             # Upload result to Firebase
#             firebase_url = upload_to_firebase(edited_image)
#             print(f"✅ [DiffEdit] Done transforming: {firebase_url}")

#             return {
#                 "transform": {
#                     "occupation": data.occupation,
#                     "images": {"original": data.images.url, "url": firebase_url}
#                 }
#             }

#         except Exception as e:
#             print(f"❌ [DiffEdit] Failed transforming: {str(e)}")
#             raise HTTPException(status_code=500, detail=str(e))