# 🧠 Editing Model Backend (FastAPI)

This module (`editingModel/`) provides a FastAPI backend service that hosts multiple image-to-image transformation pipelines using **Hugging Face Diffusers** and **Firebase Storage**. It supports three key image editing models:

- 🖌️ InstructPix2Pix
- 🎨 MagicBrush
- 🧬 Kandinsky Img2Img (Decoder)

---

## 🚀 Features

- FastAPI-based REST API
- Async-safe concurrency for model inference
- Supports three endpoints:
  - `/transform-image` → InstructPix2Pix
  - `/transform-img2img` → Kandinsky Img2Img
  - `/transform-magicbrush` → MagicBrush
- Firebase Storage upload + signed public URLs

---

## 🧰 Folder Contents

| File           | Description |
|----------------|-------------|
| `main.py`      | FastAPI app with all transformation routes |
| `requirements.txt` | Python dependencies |
| `start.sh`     | Startup script |
| `build.sh`     | (Optional) Build setup script for deployment |

---

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Environment Variables

Create a `.env` file in the root of the repository with:

```env
HF_TOKEN=your_huggingface_token
FIREBASE_KEY_PATH=./config/firebase_key.json
```

You must also download your Firebase service account JSON key and place it at the path specified above.

### 3. Run the API Server

```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```

---

## 🔥 Firebase Notes

- Requires `firebase-admin` Python SDK
- Expects `mds11-ee45b.firebasestorage.app` as the bucket name
- Images are uploaded under the `cache/` directory and made public via URL

---

## 📦 Supported Models

- `timbrooks/instruct-pix2pix`
- `kandinsky-community/kandinsky-2-2-decoder`
- `vinesmsuic/magicbrush-jul7`

---

## 📬 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/transform-image` | Run InstructPix2Pix transformation |
| `POST` | `/transform-img2img` | Run Kandinsky Img2Img |
| `POST` | `/transform-magicbrush` | Run MagicBrush pipeline |

Each endpoint expects:

```json
{
  "occupation": "Nurse",
  "images": {
    "name": "123.jpg",
    "url": "https://firebase..."
  }
}
```

And returns:

```json
{
  "transform": {
    "occupation": "Nurse",
    "images": {
      "original": "...",
      "url": "https://firebase..."
    }
  }
}
```

---

## 🧠 Concurrency

To prevent overloading the models:
- Each pipeline has an `asyncio.Semaphore` with a limit of 2 concurrent requests

---

## 📄 License

This is part of the MDS11 Final Year Project (Monash University). For academic use only.
