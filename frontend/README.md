<<<<<<< HEAD
# 🧠 MDS11 BiasLens — Frontend Interface

This is the **frontend-only** repository for **MDS11 BiasLens**, a final-year data science project focused on evaluating demographic bias in AI-generated images. This React-based web interface allows users to generate face images, apply occupation-based transformations using AI models, and analyze potential bias across gender, age, and race.

> 🔗 Backend and API code: See [`mainEndpoint`,`editingModel`,`biasAnalyse`](https://github.com/ongzn/MDS11_BiasLens.git)

---

## 📸 Screenshots

### Original Images Page  
Users select gender, age, and race to generate or upload consistent images.

### Transformation Page  
Apply occupations (e.g., nurse, pilot) using AI editing models.

### Result Page  
View comparison images, bias scores, and summary charts.

---

## 🏗️ Tech Stack

- ⚛️ React (Vite)
- 🎨 Tailwind CSS + custom components
- 🔁 Axios for API communication
- 💾 Firebase Storage integration
- 🧪 Framer Motion for animations
- 📊 Custom bias analysis visualizations (charts, grids)
=======
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
>>>>>>> origin/main

---

## 🚀 Getting Started

<<<<<<< HEAD
### 1. Clone the repository

```bash
git https://github.com/ongzn/MDS11_BiasLens.git
cd frontend
```

### 2. Install dependencies

```bash
npm install
npm install react-responsive-carousel
npm install react react-dom react-icons
```

### 3. Start the development server

```bash
npm run dev
```

> This will start the frontend at [http://localhost:5173](http://localhost:5173)

Make sure the backend (Node.js + FastAPI) is running and properly connected via `env.js`.

---

## 🔧 File Structure

```
frontend/
│
├── src/
│   ├── components/         # Shared UI components (buttons, modals, headers)
│   ├── pages/              # Main views (Landing, OriginalImages, TransformedImages, Result)
│   ├── styles/             # CSS styling per page
│   ├── context/            # Global state management (image selections, analysis results)
│   └── App.jsx             # Main router + layout
│
├── public/
│
├── index.html              # App entry point
└── vite.config.js
```

---

## 🧪 Testing

This project does not yet include automated tests. Manual testing is done across all major pages:
- Validation of demographic filter logic
- Occupation prompt and image transformation checks
- CSV export function from results
- Image refresh, loading states, and modals
=======
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
>>>>>>> origin/main

---

## 📄 License

<<<<<<< HEAD
This project is developed as part of the MDS11 final-year capstone at Monash University. All AI models used (e.g., InstructPix2Pix) are sourced under their respective licenses.

---
=======
Part of the MDS11 final year project. See the [root README](../README.md) for details.
>>>>>>> origin/main
