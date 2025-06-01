// env.js
const ENV = process.env.NODE_ENV || 'development';

const CONFIG = {
  development: {
    MAIN_ENDPOINT: 'http://localhost:8001',
    MODEL_ENDPOINT: 'http://localhost:8000',
    BIAS_ANALYSIS: 'http://localhost:8005/analyze_bias'
  },
  production: {
    MAIN_ENDPOINT: 'https://mds11.onrender.com',
    MODEL_ENDPOINT: 'https://mds11.onrender.com',
    BIAS_ANALYSIS: 'https://imagedit-bias-backend.onrender.com/analyze-bias'
  }
};

module.exports = CONFIG[ENV];