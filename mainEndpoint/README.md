# 📡 Main Endpoint (Express.js API)

This directory (`mainEndpoint/`) contains the **Express.js backend** for the MDS11 BiasLens project. It serves as the middleware that connects the frontend interface with the FastAPI model backend and Firebase Storage.

---

## ⚙️ Features

- Serves original images randomly from Firebase based on selected demographic filters (gender, age, race).
- Handles image refresh requests to regenerate single images.
- Proxies transformation requests (Pix2Pix, MagicBrush, Img2Img) to the model backend.
- Handles bias analysis requests by forwarding them to the appropriate service.
- Supports uploading user-transformed images to Firebase.

---

## 🗂️ File Structure

```bash
mainEndpoint/
├── .render/               # Render deployment settings (if used)
├── index.js               # Main Express server
├── start.sh               # Startup script (used for deployment)
├── package.json           # NPM dependencies and scripts
├── package-lock.json      # Locked dependency versions
├── requirements.txt       # Python dependencies (shared with backend if needed)
└── .DS_Store              # (macOS metadata - can be ignored)
```

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd mainEndpoint
npm install
```

### 2. Setup Environment

Make sure your `.env` file is placed in the project root (one level above `mainEndpoint/`).

It should contain:

```
FIREBASE_KEY_PATH=./firebase_key.json
HF_TOKEN=your_huggingface_token
```

And ensure `firebase_key.json` is placed where the path above expects.

### 3. Run Locally

```bash
node index.js
```

Server should run on port `5001` by default.

---

## 📦 Endpoints

| Route                   | Method | Description                                 |
|------------------------|--------|---------------------------------------------|
| `/get-random-images`   | POST   | Get random images from Firebase             |
| `/refresh-image`       | POST   | Replace a specific image                    |
| `/transform-image`     | POST   | Pix2Pix transformation                      |
| `/transform-img2img`   | POST   | Kandinsky Img2Img transformation            |
| `/transform-magicbrush`| POST   | MagicBrush transformation                   |
| `/analyze-bias`        | POST   | Analyze bias based on transformations       |
| `/upload-images`       | POST   | Upload new user-transformed image to cloud  |

---

## 🧠 Notes

- Use `dotenv` to load environment variables securely.
- Use signed URLs to serve images from Firebase if not public.
- Avoid hardcoding credentials. All secrets should come from `.env`.

---

## 🧑‍💻 Authors

This service is part of the [MDS11 BiasLens](https://github.com/ongzn/MDS11_BiasLens) final-year project.
