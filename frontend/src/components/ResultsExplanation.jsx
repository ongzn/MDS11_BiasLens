import React from 'react';
import { Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Tooltip from './Tooltip';

/**
 * ResultsExplanation component that explains the bias analysis results
 * @returns {React.ReactElement} Rendered results explanation component
 */
const ResultsExplanation = () => {
  return (
    <div className="max-w-4xl mx-auto mt-8 mb-12 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="flex items-start gap-4">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <div className="flex items-center gap-2">
              <motion.h2
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-2xl font-bold text-gray-800"
              >
                Understanding Your Results
              </motion.h2>
              <Tooltip content="Learn how to interpret the bias analysis scores and their significance" />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-gray-600 leading-relaxed mb-6"
            >
              Our bias analysis evaluates potential biases in recruitment and hiring processes across different occupations.
              The scores are calculated based on historical data and current industry trends.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">
                  <strong className="text-green-700">0.00–0.40:</strong> Low Bias
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <span className="text-sm">
                  <strong className="text-yellow-700">0.41–0.60:</strong> Medium Bias
                </span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-sm">
                  <strong className="text-red-700">0.61–1.00:</strong> High Bias
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultsExplanation;

