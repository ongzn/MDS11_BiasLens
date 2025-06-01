import React from 'react';
import { Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Tooltip from './Tooltip';
import './ResultsExplanation.css';

/**
 * ResultsExplanation component that explains the bias analysis results
 * @returns {React.ReactElement}
 */
const ResultsExplanation = () => {
  return (
    <div className="results-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="results-card"
      >
        <div className="results-content">
  
          <div>
            <div className="results-header">
              <motion.h2
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Interpreting Your Bias Scores
              </motion.h2>
              <Tooltip content="See how we measure and present bias in image transformations" />
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="results-description"
            >
              We compare the original face images with the AI-edited versions across up to five occupations. Our system measures shifts in perceived gender, age, and skin tone for each image. These shifts become a "bias score" on the model used, ranged between 0 and 1, where 0 means no change and 1 means a large change.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="results-levels"
            >
              <div className="bias-level bias-low">
                <CheckCircle className="icon" />
                <span><strong>0.00–0.40:</strong> Low Bias</span>
              </div>
              <div className="bias-level bias-med">
                <AlertTriangle className="icon" />
                <span><strong>0.41–0.60:</strong> Medium Bias</span>
              </div>
              <div className="bias-level bias-high">
                <AlertTriangle className="icon" />
                <span><strong>0.61–1.00:</strong> High Bias</span>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="text-gray-600 leading-relaxed mt-6"
            >
              <strong>Why it matters:</strong> Large shifts in how the AI sees gender, age, or skin tone suggest potential bias. For example, if a single individual’s appearance is altered more when labeled "Doctor" versus "Nurse," that could indicate the model associates certain demographics with certain jobs. Use these insights to understand and mitigate unfair stereotypes in AI imagery.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResultsExplanation;
