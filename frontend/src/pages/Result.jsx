// src/pages/Result.jsx

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

import Header from '../components/Header';
import ResultsExplanation from '../components/ResultsExplanation';
import ResultsGrid from '../components/ResultsGrid';
import BiasSection from '../components/BiasSection';
import BiasProgress from '../components/BiasProgress';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const Result = () => {
  const [data, setData]   = useState(null);
  const [error, setError] = useState(null);
  const location          = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const result = location.state?.result;
    if (result) {
      setData(result);
    } else {
      setError('No data provided');
    }
  }, [location.state]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-red-600 text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Header />

      <div className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full space-y-8">
        <div className="button-row-bottom">
          <Button label="Back" onClick={() => navigate('/transformed')} />
        </div>

        {/* Explanation */}
        <ResultsExplanation />

        {/* Scrollable image/results grid */}
        <ResultsGrid data={data} />

        {/* Combined distribution + pie */}
        <BiasSection data={data} />

        {/* Only the standalone progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <BiasProgress data={data} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Result;
