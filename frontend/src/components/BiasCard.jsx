import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import Tooltip from './Tooltip';

/**
 * BiasCard component displays bias analysis results for a specific occupation
 */
const BiasCard = ({
  genderBias,
  ageBias,
  raceBias,
  imagePairs,
  occupation,
  index,
  originalAge,
  transformedAge,
  originalGender,
  transformedGender,
  originalAPD,
  transformedAPD
}) => {
  const getBiasInfo = (value) => {
    if (value <= 0.4) return { color: 'text-green-600', icon: CheckCircle, label: 'Low Bias' };
    if (value <= 0.6) return { color: 'text-yellow-600', icon: AlertTriangle, label: 'Medium Bias' };
    return { color: 'text-red-600', icon: XCircle, label: 'High Bias' };
  };

  const safeAgeBias = Math.min(ageBias, 1).toFixed(2);
  const safeRaceBias = Math.min(raceBias, 1).toFixed(2);

  const ageBiasInfo = getBiasInfo(ageBias);
  const raceBiasInfo = getBiasInfo(raceBias);

  // Determine if gender changed or not (0 = unchanged, 1 = changed)
  const genderChanged = genderBias >= 1;
  const genderColor = genderChanged ? 'text-red-600' : 'text-green-600';
  const genderIcon = genderChanged ? XCircle : CheckCircle;
  const genderText = genderChanged ? 'Changed' : 'Unchanged';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-lg w-full min-h-[450px] flex flex-col justify-between"
    >
      <div className="relative">
        <div className="grid grid-cols-2 gap-1">
          {imagePairs.map((pair, idx) => (
            <React.Fragment key={idx}>
              <div className="relative">
                <img
                  src={pair?.originalImage}
                  alt={`Original ${occupation}`}
                  className="w-full h-64 object-cover rounded-tl-lg"
                />
                <div className="absolute bottom-0 left-0 bg-gray-900/70 text-white px-2 py-1 text-xs">
                  Original
                </div>
              </div>
              <div className="relative">
                <img
                  src={pair?.transformedImage}
                  alt={`Transformed ${occupation}`}
                  className="w-full h-64 object-cover rounded-tr-lg"
                />
                <div className="absolute bottom-0 left-0 bg-gray-900/70 text-white px-2 py-1 text-xs">
                  Transformed
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="absolute top-2 left-2 bg-gray-900/70 text-white px-3 py-1 rounded-full text-sm font-medium">
          {index}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          
        </h3>

        <div className="space-y-2">
          {/* Gender Bias */}
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <span className="text-sm font-medium text-gray-600">
              Gender Bias
              <Tooltip content="Gender is considered changed if the model predicted a different gender after transformation" />
            </span>
            <div className={`flex items-center gap-2 ${genderColor}`}>
              <genderIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">{genderText}</span>
            </div>
          </div>

          {/* Age Bias */}
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <span className="text-sm font-medium text-gray-600">
              Age Bias
              <Tooltip content="Indicator of age-based discrimination in model predictions" />
            </span>
            <div className="flex items-center gap-2">
              <ageBiasInfo.icon className={`w-4 h-4 ${ageBiasInfo.color}`} />
              <span className={`text-sm font-semibold ${ageBiasInfo.color}`}>
                {safeAgeBias}
              </span>
            </div>
          </div>

          {/* Race Bias */}
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <span className="text-sm font-medium text-gray-600">
              Race Bias
              <Tooltip content="Measure of potential bias based on skin tone or ethnicity" />
            </span>
            <div className="flex items-center gap-2">
              <raceBiasInfo.icon className={`w-4 h-4 ${raceBiasInfo.color}`} />
              <span className={`text-sm font-semibold ${raceBiasInfo.color}`}>
                {safeRaceBias}
              </span>
            </div>
          </div>

          {/* Original vs Transformed Info */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-gray-50 p-2 rounded text-sm text-gray-700 h-full">
              <strong>Original Age:</strong> {originalAge ?? 'N/A'} <br />
              <strong>Original Gender:</strong> {originalGender ?? 'N/A'} <br />
              <strong>Original APD:</strong> {originalAPD ?? 'N/A'}
            </div>
            <div className="bg-gray-50 p-2 rounded text-sm text-gray-700 h-full">
              <strong>Transformed Age:</strong> {transformedAge ?? 'N/A'} <br />
              <strong>Transformed Gender:</strong> {transformedGender ?? 'N/A'} <br />
              <strong>Transformed APD:</strong> {transformedAPD?? 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BiasCard;
