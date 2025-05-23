# 📊 MDS11_BiasLens Frontend

This is the React + Vite frontend for **MDS11 BiasLens**, a final year project that analyzes demographic bias in AI-generated occupation images.

---

## ⚙️ Project Structure

```bash
frontend/
├── public/                    # Static assets (favicon, etc.)
├── src/
│   ├── pages/                 # Main pages (Landing, OriginalImages, TransformedImages, Result)
│   ├── components/            # Reusable UI components (Header, Modal, Charts, etc.)
│   ├── context/               # Global context for app-wide state (selected attributes, images)
│   ├── App.jsx                # Root component
│   └── main.jsx               # App entry point
├── .env.development           # Development environment variables (excluded from Git)
├── .env.production            # Production environment variables (excluded from Git)
├── tailwind.config.js        # Tailwind CSS setup
├── vite.config.js            # Vite config
```

---

## 🧪 Features

- 🎛️ **Filter Selection UI**: Choose gender, age, race and number of images.
- 📸 **Image Generation**: Generates FairFace original and transformed occupation images via backend API.
- 📈 **Bias Analysis Result**: Visualizes demographic bias using charts (bar, pie, dumbbell, gauge).
- 🧠 **Model Switcher**: Supports InstructPix2Pix, Kandinsky Img2Img, and MagicBrush via backend endpoints.
- 💾 **Firebase**: Loads original images and uploads generated ones using signed URLs.
- 💬 **Modals & Feedback**: Integrated loading states, error alerts, and confirmation dialogs.

---

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Set environment endpoints**:  
   Edit `.env.development` and `.env.production` with your API URLs:
   ```
   VITE_MAIN_ENDPOINT=http://localhost:5001
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
---

## 📦 Deployment

This frontend can be deployed to **Vercel**, **Netlify**, or any static host that supports Vite builds.

```bash
npm run build
```

Then serve the `dist/` folder using your preferred method.

---

## 📄 License

Part of the MDS11 final year project. See the [root README](../README.md) for details.
