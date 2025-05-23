import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

// Color logic for arc fill
const getArcColor = (percent) => {
  if (percent <= 40) return '#22C55E';     // Green (Tailwind: green-500)
  if (percent <= 60) return '#EAB308';     // Mustard/Yellow (Tailwind: yellow-500)
  return '#EF4444';                        // Red (Tailwind: red-500)
};

const CustomTooltip = ({ highest, lowest }) => (
  <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-white border border-gray-300 shadow-md rounded px-3 py-2 text-sm z-10 whitespace-nowrap">
    <div>Highest Bias: {highest.toFixed(2)}</div>
    <div>Lowest Bias: {lowest.toFixed(2)}</div>
  </div>
);

const BiasGauge = ({ label, value, highest, lowest }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const percent = Math.round(value * 100);
  const arcColor = getArcColor(percent);

  const backgroundData = [{ name: 'bg', value: 100, fill: '#E5E7EB' }];
  const actualData = [{ name: label, value: percent, fill: arcColor }];

  return (
    <div className="relative flex flex-col items-center w-[180px] h-[220px] group">
      <div
        className="relative w-full h-[180px]"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {showTooltip && (
          <CustomTooltip highest={highest} lowest={lowest} />
        )}

        {/* Background ring */}
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={22}
            startAngle={0}
            endAngle={360}
            data={backgroundData}
          >
            <RadialBar dataKey="value" clockWise cornerRadius={50} />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Foreground partial fill */}
        <div className="absolute top-0 left-0 w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              barSize={22}
              startAngle={90}
              endAngle={90 - (360 * percent / 100)}
              data={actualData}
            >
              <RadialBar dataKey="value" clockWise cornerRadius={50} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>

        {/* Centered % */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-800">{percent}%</span>
        </div>
      </div>

      {/* Label */}
      <div className="text-center mt-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
    </div>
  );
};

const BiasGaugeChart = ({ data }) => {
  if (!data?.bias_summary) return null;

  const { gender_bias, age_bias, race_bias } = data.bias_summary;

  const ageVals = data.age_bias_matrix.flatMap(({ image_name, ...rest }) => Object.values(rest));
  const genVals = data.gender_bias_matrix.flatMap(({ image_name, ...rest }) => Object.values(rest));
  const raceVals = data.race_bias_matrix.flatMap(({ image_name, ...rest }) => Object.values(rest));

  const highestAge = Math.max(...ageVals), lowestAge = Math.min(...ageVals);
  const highestGen = Math.max(...genVals), lowestGen = Math.min(...genVals);
  const highestRace = Math.max(...raceVals), lowestRace = Math.min(...raceVals);

  return (
    <motion.div
      className="rounded-lg shadow-md bg-white px-6 pt-6 pb-6 w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-xl font-semibold text-center text-gray-800 mb-6">
        Bias Progress Overview
      </h3>

      <div className="flex justify-center gap-10">
        <BiasGauge
          label="Gender Bias"
          value={gender_bias}
          highest={highestGen}
          lowest={lowestGen}
        />
        <BiasGauge
          label="Age Bias"
          value={age_bias}
          highest={highestAge}
          lowest={lowestAge}
        />
        <BiasGauge
          label="Race Bias"
          value={race_bias}
          highest={highestRace}
          lowest={lowestRace}
        />
      </div>
    </motion.div>
  );
};

export default BiasGaugeChart;
