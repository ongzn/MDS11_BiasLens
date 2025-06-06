// index.js

/**
 * This is the main Express.js server for the BiasLens application.
 * It connects the frontend with Firebase and external AI services (FastAPI, Render).
 * Responsibilities include:
 * - Fetching random images from Firebase based on demographic filters
 * - Uploading user images to Firebase
 * - Proxying image transformation and bias analysis requests to external services
 * - Refreshing specific images within an existing selection
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = process.env.PORT || 5001;

const config = require('../env');
const FASTAPI_BASE_URL = config.MODEL_ENDPOINT;
const BIAS_API_URL = config.BIAS_ANALYSIS;

// Load Firebase credentials and initialize storage bucket
require('dotenv').config();
const serviceAccount = require(path.join(__dirname, '..', 'config', 'firebase_key.json'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'mds11-ee45b.firebasestorage.app'
});
const bucket = admin.storage().bucket();
console.log("Firebase ready.");

app.use(cors());
app.use(express.json({ limit: '100mb' }));

/**
 * POST /get-random-images
 * Fetches a set of randomly selected demographic-based images from Firebase
 */
app.post('/get-random-images', async (req, res) => {
  const { gender, age, race, num } = req.body;
  if (!gender || !age || !race || !num) {
    return res.status(400).json({ error: 'Missing gender, age, race, or num' });
  }

  const folderName = `originals/${gender}_${age}_${race}`.replace(/\s+/g, '-');

  try {
    const [files] = await bucket.getFiles({ prefix: folderName + '/' });
    const imageFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f.name));

    if (imageFiles.length === 0) {
      return res.status(404).json({ error: 'No images found in Firebase folder' });
    }

    const selectedFiles = imageFiles.sort(() => 0.5 - Math.random()).slice(0, parseInt(num));
    const result = await Promise.all(
      selectedFiles.map(async file => {
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000
        });
        return { name: path.basename(file.name), url };
      })
    );

    res.json({ images: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch images from Firebase' });
  }
});

/**
 * POST /refresh-image
 * Returns a different image from the same demographic group to replace an existing one
 */
app.post('/refresh-image', async (req, res) => {
  const { images, replace } = req.body;

  if (!images || !replace || replace.length === 0) {
    return res.status(400).json({ error: 'Missing images or replace array' });
  }

  const currentImageNames = images.map(img => img.name);
  const folderMatch = replace.url.match(/originals\/([^\/]+)\//);

  if (!folderMatch) {
    return res.status(400).json({ error: 'Invalid Firebase URL format' });
  }

  const folderPath = `originals/${folderMatch[1]}/`;
  try {
    const [files] = await bucket.getFiles({ prefix: folderPath });
    const available = files.filter(f =>
      /\.(jpg|jpeg|png)$/i.test(f.name) &&
      !currentImageNames.includes(path.basename(f.name))
    );

    if (available.length === 0) {
      return res.status(404).json({ error: 'No replacement images available' });
    }

    const randomFile = available[Math.floor(Math.random() * available.length)];
    const [url] = await randomFile.getSignedUrl({
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000
    });

    res.json({
      replacement: {
        name: path.basename(randomFile.name),
        url
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to refresh image from Firebase' });
  }
});

/**
 * Proxy route to forward image transformation requests to FastAPI services
 */
['image', 'img2img', 'magicbrush'].forEach(endpoint => {
  app.post(`/transform-${endpoint}`, async (req, res) => {
    try {
      const response = await axios.post(`${FASTAPI_BASE_URL}/transform-${endpoint}`, req.body, {
        headers: { 'Content-Type': 'application/json' }
      });
      res.status(response.status).json(response.data);
    } catch (err) {
      console.error(`❌ [Express->FastAPI] transform-${endpoint} failed:`, err?.response?.data || err.message);
      if (err.response) res.status(err.response.status).json(err.response.data);
      else res.status(500).json({ error: 'Internal proxy error' });
    }
  });
});

/**
 * POST /analyze-bias
 * Sends transformed images and original images to bias analysis backend
 */
app.post('/analyze-bias', async (req, res) => {
  try {
    const response = await axios.post(BIAS_API_URL, req.body, {
      headers: { 'Content-Type': 'application/json' }
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    console.error('❌ [Express->Render] analyze-bias failed:', err?.response?.data || err.message);
    if (err.response) res.status(err.response.status).json(err.response.data);
    else res.status(500).json({ error: 'Internal proxy error' });
  }
});

/**
 * POST /upload-images
 * Uploads user-provided images (base64 format) to Firebase Storage
 */
app.post('/upload-images', async (req, res) => {
  const { images } = req.body;

  if (!images || !Array.isArray(images)) {
    return res.status(400).json({ error: 'Missing or invalid "images" array in request body' });
  }

  for (const img of images) {
    if (typeof img.base64 !== 'string' || !img.base64.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Unsupported media type: only image/* is allowed' });
    }
  }

  try {
    const result = await Promise.all(
      images.map(async (img) => {
        const buffer = Buffer.from(img.base64.split(',')[1], 'base64');
        const fileName = `upload/${uuidv4()}.png`;
        const file = bucket.file(fileName);

        await file.save(buffer, {
          contentType: 'image/png',
          public: true
        });

        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        return { name: path.basename(fileName), url: publicUrl };
      })
    );

    res.json({ uploaded: result });
  } catch (err) {
    console.error('❌ Failed to upload images:', err);
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});