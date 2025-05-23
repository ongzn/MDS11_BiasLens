# MDS11_BiasLens

This repository contains the full source code for **MDS11 BiasLens**, a final-year project designed to explore and analyze **demographic bias** (gender, age, race) in AI-generated images. The system is built using a combination of React (frontend), Express.js (API), and FastAPI (model serving), and it integrates with Firebase Storage to manage and serve image data.

---

## 🎯 Project Objective

The goal of this assignment is to evaluate whether modern image generation models (e.g., InstructPix2Pix, Kandinsky, MagicBrush) demonstrate demographic bias when transforming human portraits into images representing various occupations. This is done by:

- Generating original images from a balanced dataset (FairFace).
- Applying prompt-based image transformations (e.g., "A photo of a nurse").
- Analyzing patterns of bias using an automated analysis module.

---

## 🗂️ Project Structure

```
MDS11_BiasLens/
│
├── frontend/           # React frontend for selecting filters, generating images, and viewing bias results
├── mainEndpoint/       # Node.js Express API that connects frontend to model & bias analysis backend
├── editingModel/       # FastAPI model server using Hugging Face pipelines (Pix2Pix, Img2Img, MagicBrush)
├── biasAnalyse/        # (Optional) Bias analysis service (can be run locally or via Render)
│
├── firebase_key.json   # Firebase service account config (DO NOT commit this publicly)
├── env.js              # Configuration for endpoints and environment variables
├── run_all.sh          # ✅ Main script to install dependencies and start all services
└── README.md
```

---

## 🚀 Quick Start

### 1. **Prerequisites**

- Python ≥ 3.9
- Node.js ≥ 18
- Conda or virtualenv (recommended)
- Firebase Service Account JSON (place in `/config/firebase_key.json`)
- Hugging Face Token (free from https://huggingface.co/settings/tokens)

> 🔐 **Firebase Note**:  
> You can set up your own Firebase project and create a service account to generate your own `firebase_key.json`.  
> Refer to: [Firebase Admin Setup Docs](https://firebase.google.com/docs/admin/setup)  
> 1. Go to Firebase Console → Project Settings → Service Accounts  
> 2. Click **"Generate new private key"** and save the JSON file.  
> 3. Place it in `./config/firebase_key.json`.
🖼️ Setting Up Image Database on Firebase Storage

To run the system with the correct image pipeline, you must organize your original images in Firebase Cloud Storage using the following structure:

>🔧 Step-by-Step Guide
> 1. Go to Firebase Console
     Open your project and navigate to Build → Storage.
> 2. Enable Cloud Storage if not already enabled.
> 3. Inside your Storage, create a folder called: originals/
> 4. Inside the originals/ folder, create 18 subfolders based on combinations of gender, age, and race:
```
        originals/
        ├── Female_20-29_Black/
        ├── Female_20-29_White/
        ├── Female_20-29_EastAsian/
        ├── Female_40-49_Black/
        ├── Female_40-49_White/
        ├── Female_40-49_EastAsian/
        ├── Female_60-69_Black/
        ├── Female_60-69_White/
        ├── Female_60-69_EastAsian/
        ├── Male_20-29_Black/
        ├── Male_20-29_White/
        ├── Male_20-29_EastAsian/
        ├── Male_40-49_Black/
        ├── Male_40-49_White/
        ├── Male_40-49_EastAsian/
        ├── Male_60-69_Black/
        ├── Male_60-69_White/
        ├── Male_60-69_EastAsian/
```
> 6. Upload image files (.jpg or .png) inside each folder. Recommended size: ~600x600px.
> 🔐 Make sure:
> •	Images are publicly readable (or use signed URL logic like the project does).
> •	The folder naming matches exactly what the system expects.
> •	Each folder contains enough images (≥10 recommended).

> 🧠 Hugging Face Token:
> This project uses Hugging Face models (e.g., Pix2Pix, Kandinsky, MagicBrush).
> To use them, sign up at huggingface.co and get your personal access token.
> Replace the hardcoded HF_TOKEN in editingModel/main.py with your own token.
> 1. Go to your Hugging Face account → Settings → Access Tokens.
> 2. Create a new token (choose “read” access).
> 3. Replace the value in main.py like this:
>    HF_TOKEN = "your_actual_token_here"

---

### 2. **Running All Services**

Use the provided script to start everything in development mode:

```bash
bash run_all.sh
```

This will:
- Install Python and Node.js dependencies
- Start the FastAPI server (model pipelines)
- Start the Express backend (API and Firebase handling)
- Launch the React frontend on an available port (usually http://localhost:5173 or similar)

---

### 3. **Usage**

- Visit the frontend URL (printed in terminal) to interact with the UI.
- Select demographic filters (e.g., gender, age, race) and generate original images.
- Choose occupations and apply transformations using different models.
- Click **Analyze Bias** to view summary results by demographic category.

---

### 4. **Switching Between Development and Production**

You can change the running mode by editing the environment variable in `.env.development` or `.env.production`.

For example:

```
MODE=development   # for local testing
MODE=production    # for deployment
```

Update your scripts and backend logic to read from this `MODE` and adjust behavior accordingly.

---

## 🛠️ Technologies Used

- 🧠 **Hugging Face Diffusers**: InstructPix2Pix, Kandinsky 2.2
- 🔥 **Firebase Storage**: Hosting image assets and cache
- 🧪 **FastAPI**: Model-serving backend
- 🖼️ **React + Vite**: Frontend application
- 🔧 **Express.js**: API middleware
- 📦 **Render + RunPod** (optional): Deployment platforms for bias analysis and GPU inference

---

## ⚠️ Important Notes

- **Do not commit** your `firebase_key.json` or Hugging Face tokens to public repositories.
- Ensure that your models are loaded only once at startup to reduce cold-start latency.
- Use environment variables or `.env.development` to store sensitive config for production use.

---

## 📄 License

This project is developed as part of Monash University's MDS11 final-year project. All models used are publicly available under their respective licenses.

---

## 👩‍💻 Maintained by

- **Louis Meng Hoe Chow** (Student ID: 32937350)
- **Syed Fakhar Un Nabi** (Student ID: 33509409)
- **Phoebe Ting Wei Jia** (Student ID: 33454868)
- **Ong Zhen Ni** (Student ID: 32842848)
- Supervisor: Professor Dr. Raphael Phan
