// Result.jsx
// This component displays the final results of the bias analysis including grid view, summary, progress, and export functionality.
// It handles data processing, CSV export logic, UI rendering, and confirmation prompts for navigation.

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Result.css';
import Modal from '../components/Modal';
import Header from '../components/Header';
import ResultsExplanation from '../components/ResultsExplanation';
import ResultsGrid from '../components/ResultsGrid';
import BiasSection from '../components/BiasSection';
import BiasProgress from '../components/BiasProgress';
import Button from '../components/Button';
import BiasFailureQueue from '../components/BiasFaliureQueue';

const Result = () => {
  // Main state for result data and errors
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Router hooks for state and navigation
  const location = useLocation();
  const navigate = useNavigate();

  // Modal state to confirm navigation
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // CSV export logic on 'export-csv' event
  useEffect(() => {
    const handleExport = () => {
      if (!data || !data.metrics) return;

      const urlMap = {};
      const originalUrlMap = {};

      // Mapping transformed image URLs by image and occupation
      data.transform.forEach((job) => {
        const occupation = job.occupation;
        job.images.forEach((img) => {
          const key = `${parseInt(img.original)}_${occupation}`;
          urlMap[key] = img.url;
        });
      });

      // Mapping original image URLs by name
      data.originals.forEach((orig) => {
        originalUrlMap[orig.name] = orig.url;
      });

      // Flattening age bias matrix
      const ageBiasMap = {};
      data.age_bias_matrix.forEach((row) => {
        const { image_name, ...rest } = row;
        Object.entries(rest).forEach(([occupation, value]) => {
          ageBiasMap[`${image_name}_${occupation}`] = value;
        });
      });

      // Flattening gender bias matrix
      const genderBiasMap = {};
      data.gender_bias_matrix.forEach((row) => {
        const { image_name, ...rest } = row;
        Object.entries(rest).forEach(([occupation, value]) => {
          genderBiasMap[`${image_name}_${occupation}`] = value;
        });
      });

      // Flattening race bias matrix
      const raceBiasMap = {};
      data.race_bias_matrix.forEach((row) => {
        const { image_name, ...rest } = row;
        Object.entries(rest).forEach(([occupation, value]) => {
          raceBiasMap[`${image_name}_${occupation}`] = value;
        });
      });

      // Creating set of failed transformation keys
      const failedKeys = new Set(
        (data.bias_failures?.details || []).map(f => `${f.image_name}_${f.occupation}`)
      );

      // Populating export rows with all combined metrics
      const rows = [];
      const occupations = Object.keys(data.metrics);

      occupations.forEach((occupation) => {
        data.metrics[occupation].forEach((item) => {
          const imageKey = `${item.image_name}.jpg`;
          const key = `${item.image_name}_${occupation}`;

          rows.push({
            Occupation: occupation,
            Original_Image_URL: originalUrlMap[imageKey] || 'Not found',
            Transformed_Image_URL: urlMap[key] || 'Not found',
            Original_Age: item.original_age,
            Transformed_Age: item.transformed_age,
            Age_Delta: item.age_delta,
            Age_Bias: ageBiasMap[key] ?? '',
            Original_Gender: item.original_gender,
            Transformed_Gender: item.transformed_gender,
            Gender_Changed: item.gender_flag,
            Gender_Bias: genderBiasMap[key] ?? '',
            Original_Darkness: item.original_avg_darkness,
            Transformed_Darkness: item.transformed_avg_darkness,
            Race_Bias: raceBiasMap[key] ?? '',
            Status: failedKeys.has(`${item.image_name}_${occupation}`) ? 'Fail' : 'Success',
          });
        });
      });

      // Header and summary for CSV export
      const summaryLines = [
        'Overall Bias Summary',
        `Attribute,${data.bias_summary.attribute}`,
        `Age Bias,${data.bias_summary.age_bias}`,
        `Gender Bias,${data.bias_summary.gender_bias}`,
        `Race Bias,${data.bias_summary.race_bias}`,
        '',
        'Detailed Results',
      ];

      const header = Object.keys(rows[0]);
      const csvLines = [
        ...summaryLines,
        header.join(','),
        ...rows.map(row =>
          header.map(key =>
            row[key] !== undefined && row[key] !== null ? row[key] : 'null'
          ).join(',')
        )
      ];

      const csvContent = csvLines.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bias_results_with_summary.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    window.addEventListener('export-csv', handleExport);
    return () => window.removeEventListener('export-csv', handleExport);
  }, [data]);

  // Extract result data from route state
  useEffect(() => {
    const result = location.state?.result;
    if (result) {
      setData(result);
    } else {
      setError('No data provided.');
    }
  }, [location.state]);

  // Display error if result data is not found
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

  // Loading spinner if data is not yet ready
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  // Render results once data is available
  return (
    <motion.div
      className="min-h-screen bg-custom-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Header />

      <div className="flex-1 max-w-7xl mx-auto px-6 pt-2 pb-10 w-full space-y">
        <div className="button-row-bottom">
          <Button label="Back" onClick={() => setShowConfirmModal(true)} />
        </div>

        {/* Explanation */}
        <ResultsExplanation />

        {/* Scrollable image/results grid */}
        <ResultsGrid data={data} />

        {/* Failed image queue (moved below ResultsGrid) */}
        <BiasFailureQueue data={data} />

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

      {/* Modal for back confirmation */}
      {showConfirmModal && (
        <Modal
          type="confirm"
          message="Going back will discard the current analysis results. Do you want to continue?"
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => navigate('/transformed')}
        />
      )}
    </motion.div>
  );
};

export default Result;
