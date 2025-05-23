import React from 'react';
import { TrendingUp, TrendingDown, Users, Clock, Globe } from 'lucide-react';
import Tooltip from './Tooltip';

/**
 * BiasStats component that displays key bias statistics
 * @param {Object} props Component props
 * @param {Object} props.data Bias analysis data
 * @returns {React.ReactElement}
 */
const BiasStats = ({ data }) => {
  // Extract average bias scores
  const avgGenderBias = data.bias_summary.gender_bias;
  const avgAgeBias = data.bias_summary.age_bias;
  const avgRaceBias = data.bias_summary.race_bias;

  // Extract individual bias values (excluding 'image_name')
  const ageBiasValues = data.age_bias_matrix.flatMap(entry =>
    Object.entries(entry)
      .filter(([key]) => key !== 'image_name')
      .map(([, value]) => value)
  );

  const raceBiasValues = data.race_bias_matrix.flatMap(entry =>
    Object.entries(entry)
      .filter(([key]) => key !== 'image_name')
      .map(([, value]) => value)
  );

  const highestAgeBias = Math.max(...ageBiasValues);
  const lowestAgeBias = Math.min(...ageBiasValues);

  const highestRaceBias = Math.max(...raceBiasValues);
  const lowestRaceBias = Math.min(...raceBiasValues);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Average Gender Bias */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-600" />
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm text-gray-600">Average Gender Bias</p>
              <Tooltip content="Average level of gender-based bias across all occupations" />
            </div>
            <p className="text-xl font-semibold">{avgGenderBias.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Average Age Bias */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-cyan-600" />
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm text-gray-600">Average Age Bias</p>
              <Tooltip content="Average level of age-related bias across all occupations" />
            </div>
            <p className="text-xl font-semibold">{avgAgeBias.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Average Race Bias */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-orange-500" />
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm text-gray-600">Average Race Bias</p>
              <Tooltip content="Average level of race-related bias across all occupations" />
            </div>
            <p className="text-xl font-semibold">{avgRaceBias.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Highest Age Bias */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-red-600" />
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm text-gray-600">Highest Age Bias</p>
              <Tooltip content="Maximum age-related bias across all image-occupation pairs" />
            </div>
            <p className="text-xl font-semibold">{highestAgeBias.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Highest Race Bias */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-orange-600" />
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm text-gray-600">Highest Race Bias</p>
              <Tooltip content="Maximum race-related bias across all image-occupation pairs" />
            </div>
            <p className="text-xl font-semibold">{highestRaceBias.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Lowest Age Bias */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-6 h-6 text-green-600" />
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm text-gray-600">Lowest Age Bias</p>
              <Tooltip content="Minimum age-related bias across all image-occupation pairs" />
            </div>
            <p className="text-xl font-semibold">{lowestAgeBias.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Lowest Race Bias */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-6 h-6 text-lime-600" />
          <div>
            <div className="flex items-center gap-1">
              <p className="text-sm text-gray-600">Lowest Race Bias</p>
              <Tooltip content="Minimum race-related bias across all image-occupation pairs" />
            </div>
            <p className="text-xl font-semibold">{lowestRaceBias.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiasStats;
