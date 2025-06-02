import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ParentSize } from '@visx/responsive';
import DumbbellChart from './charts/DumbbellChart';
import BarChart from './charts/BarChart';
import Tooltip from './Tooltip';

const BiasChart = ({ data }) => {
  const [chartType, setChartType] = useState('dumbbell');
  const [filter, setFilter] = useState('both');

  const handleChartChange = (type) => setChartType(type);
  const handleFilterChange = (e) => setFilter(e.target.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-[0_6px_24px_rgba(0,0,0,0.15)] p-6 mb-8 space-y-8"
    >
      {/* Title + Tooltip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold text-gray-800">Bias Distribution by Occupation</h3>
          <Tooltip content="Displays gender, age, and skin-tone shift scores for each occupation based on AI transformations. Use the Dumbbell or Bar view to compare changes side‐by‐side, and the filter dropdown to focus on a single bias type for clearer insights."/>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Chart Type Toggle */}
          <div className="flex gap-2 border rounded px-2 py-1 bg-gray-50">
            <button
              onClick={() => handleChartChange('dumbbell')}
              className={`text-sm px-2 py-1 rounded ${
                chartType === 'dumbbell'
                  ? 'bg-indigo-100 text-indigo-700 font-semibold'
                  : 'text-gray-600'
              }`}
            >
              Dumbbell
            </button>
            <button
              onClick={() => handleChartChange('bar')}
              className={`text-sm px-2 py-1 rounded ${
                chartType === 'bar'
                  ? 'bg-indigo-100 text-indigo-700 font-semibold'
                  : 'text-gray-600'
              }`}
            >
              Bar
            </button>
          </div>

          {/* Bias Filter Dropdown */}
          <select
            value={filter}
            onChange={handleFilterChange}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none"
          >
            <option value="both">Show All</option>
            <option value="gender">Gender Bias Only</option>
            <option value="age">Age Bias Only</option>
            <option value="race">Race Bias Only</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#4F46E5]"></div>
          <span className="text-sm text-gray-600">Gender Bias</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#06B6D4]"></div>
          <span className="text-sm text-gray-600">Age Bias</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#F97316]"></div>
          <span className="text-sm text-gray-600">Race Bias</span>
        </div>
      </div>

      {/* Chart Display */}
      <div className="h-[360px]">
        <ParentSize>
          {({ width, height }) =>
            chartType === 'dumbbell' ? (
              <DumbbellChart width={width} height={height} data={data} filter={filter} />
            ) : (
              <BarChart width={width} height={height} data={data} filter={filter} />
            )
          }
        </ParentSize>
      </div>
    </motion.div>
  );
};

export default BiasChart;
