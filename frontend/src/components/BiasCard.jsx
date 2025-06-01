import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import Tooltip from './Tooltip';

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
  // Determine color/icon for age and race bias
  const getBiasInfo = (value) => {
    if (value <= 0.4) return { color: 'text-green-600', icon: CheckCircle, label: 'Low Bias' };
    if (value <= 0.6) return { color: 'text-yellow-600', icon: AlertTriangle, label: 'Medium Bias' };
    return { color: 'text-red-600', icon: XCircle, label: 'High Bias' };
  };

  // Clamp and format numeric biases
  const safeAgeBias = Math.min(ageBias, 1).toFixed(2);
  const safeRaceBias = Math.min(raceBias, 1).toFixed(2);

  // Get display info for age and race
  const ageBiasInfo = getBiasInfo(ageBias);
  const raceBiasInfo = getBiasInfo(raceBias);

  // Gender change detection: proportion of images where predicted gender differs (0 = none, 1 = all)
  const genderChanged = genderBias >= 1;
  const genderColor = genderChanged ? 'text-red-600' : 'text-green-600';
  const GenderIcon = genderChanged ? XCircle : CheckCircle;
  const genderText = genderChanged ? 'Changed' : 'Unchanged';

  // Create React components for icons (must be capitalized)
  const AgeIcon    = ageBiasInfo.icon;
  const RaceIcon   = raceBiasInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-lg w-full min-h-[450px] flex flex-col justify-between text-sm"
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
        <div className="absolute top-2 left-2 bg-gray-900/70 text-white px-3 py-1 rounded-full text-xs font-medium">
          {index}
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-2">
          {/* Gender Bias */}
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <span className="font-medium text-gray-600">
              Gender Bias
              <Tooltip content="Metric for images where the predicted gender changed between original and transformed (Unchanged = 0, Changed = 1)" />
            </span>
            <div className={`flex items-center gap-2 ${genderColor}`}>
              <GenderIcon className="w-4 h-4" />
              <span className="font-semibold">{genderText}</span>
            </div>
          </div>

          {/* Age Bias */}
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <span className="font-medium text-gray-600">
              Age Bias
              <Tooltip content="Normalized absolute difference in predicted age between original and transformed images (0 = no change, 1 = max change)" />
            </span>
            <div className="flex items-center gap-2">
              <AgeIcon className={`w-4 h-4 ${ageBiasInfo.color}`} />
              <span className={`font-semibold ${ageBiasInfo.color}`}>
                {safeAgeBias}
              </span>
            </div>
          </div>

          {/* Race Bias */}
          <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <span className="font-medium text-gray-600">
              Race Bias
              <Tooltip content="Normalized absolute difference in Pixel Darkness (APD) values between original and transformed images (0 = no change, 1 = max change)" />
            </span>
            <div className="flex items-center gap-2">
              <RaceIcon className={`w-4 h-4 ${raceBiasInfo.color}`} />
              <span className={`font-semibold ${raceBiasInfo.color}`}>
                {safeRaceBias}
              </span>
            </div>
          </div>

          {/* Original vs Transformed Info */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-gray-50 p-2 rounded text-gray-700 h-full">
              <strong>Original Age:</strong> {originalAge ?? 'N/A'} <br />
              <strong>Original Gender:</strong> {originalGender ?? 'N/A'} <br />
              <strong>Original APD:</strong> {originalAPD ?? 'N/A'}
            </div>
            <div className="bg-gray-50 p-2 rounded text-gray-700 h-full">
              <strong>Transformed Age:</strong> {transformedAge ?? 'N/A'} <br />
              <strong>Transformed Gender:</strong> {transformedGender ?? 'N/A'} <br />
              <strong>Transformed APD:</strong> {transformedAPD ?? 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BiasCard;