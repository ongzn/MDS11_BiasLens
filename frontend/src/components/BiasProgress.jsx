import React from 'react';
import { motion } from 'framer-motion';
import Tooltip from './Tooltip';

/**
 * BiasProgress shows overall bias score using all 3 bias types.
 * @param {Object} props
 * @param {Object} props.data Bias analysis result object
 */
const BiasProgress = ({ data }) => {
  const { gender_bias, age_bias, race_bias } = data.bias_summary;

  // Updated overall bias: include race
  const overallBias = (gender_bias + age_bias + race_bias) / 3;
  const biasPercentage = (overallBias * 100).toFixed(1);

  // Bias level descriptor
  const getBiasLevel = (bias) => {
    if (bias <= 0.4) return { label: 'Low Bias', color: 'bg-green-500' };
    if (bias <= 0.6) return { label: 'Medium Bias', color: 'bg-yellow-500' };
    return { label: 'High Bias', color: 'bg-red-500' };
  };

  const { label, color } = getBiasLevel(overallBias);

  return (
    <div className="max-w-3xl mx-auto px-6 mt-8 mb-12">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold text-gray-800">Overall Bias Level</h3>
            <Tooltip content="This overall bias score averages the normalized changes in gender, age, and skin-tone (race) predictions between your original and AI-transformed images. A value near 0 means minimal change (low bias), while a value near 1 indicates large shifts (high bias)." />
          </div>
          <span className={`text-sm font-medium ${color} px-3 py-1 rounded-full text-white`}>
            {label}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
          <motion.div
            className={`h-full ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${biasPercentage}%` }}
            transition={{ duration: 1 }}
          />
        </div>

        <div className="mt-2 text-right text-sm text-gray-600">
          Bias Score: <strong>{biasPercentage}%</strong>
        </div>
      </div>
    </div>
  );
};

export default BiasProgress;
