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

---

## 🚀 Getting Started

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

---

## 📄 License

This project is developed as part of the MDS11 final-year capstone at Monash University. All AI models used (e.g., InstructPix2Pix) are sourced under their respective licenses.

---
