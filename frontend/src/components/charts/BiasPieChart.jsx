import React from 'react';
import Tooltip from '../Tooltip';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartTooltip,
} from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#4F46E5', '#06B6D4', '#F97316'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, percentage, highest, lowest } = payload[0].payload;
  const key = name.split(' ')[0];
  return (
    <div className="bg-white p-2 border rounded shadow text-sm whitespace-pre-line">
      <div>{`${name}: ${percentage}%`}</div>
      <div>{`Highest Bias: ${highest.toFixed(2)}`}</div>
      <div>{`Lowest Bias: ${lowest.toFixed(2)}`}</div>
    </div>
  );
};

const BiasPieChart = ({ data }) => {
  if (!data) return null;
  const { gender_bias, age_bias, race_bias } = data.bias_summary;
  const total = gender_bias + age_bias + race_bias;

  // flatten out bias values
  const ageVals = data.age_bias_matrix.flatMap(({ image_name, ...rest }) => Object.values(rest));
  const genVals = data.gender_bias_matrix.flatMap(({ image_name, ...rest }) => Object.values(rest));
  const raceVals = data.race_bias_matrix.flatMap(({ image_name, ...rest }) => Object.values(rest));

  const highestAge = Math.max(...ageVals), lowestAge = Math.min(...ageVals);
  const highestGen = Math.max(...genVals), lowestGen = Math.min(...genVals);
  const highestRace = Math.max(...raceVals), lowestRace = Math.min(...raceVals);

  const pieData = [
    { name: 'Gender Bias', value: gender_bias, highest: highestGen, lowest: lowestGen },
    { name: 'Age Bias', value: age_bias, highest: highestAge, lowest: lowestAge },
    { name: 'Race Bias', value: race_bias, highest: highestRace, lowest: lowestRace },
  ].map(d => ({
    ...d,
    percentage: ((d.value / total) * 100).toFixed(1),
  }));

  return (
    <motion.div
      className="rounded-lg bg-white shadow-[0_6px_24px_rgba(0,0,0,0.15)] px-6 pt-6 pb-6 w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-center gap-2 mb-4">
        <h3 className="text-xl font-semibold text-gray-800 m-0">
          Average Bias Composition
        </h3>
        <Tooltip content="Shows how much each bias type (gender, age, race) contributes to the total bias. Hover over slices to see the highest and lowest observed values for each metric." />
      </div>
      {/* center the chart in a slightly shorter container */}
      <div className="flex justify-center items-center h-64">
        <ResponsiveContainer width="60%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              innerRadius={60} D
              dataKey="value"
              isAnimationActive
              labelLine={false}
            >
              {pieData.map((_, idx) => (
                <Cell
                  key={idx}
                  fill={COLORS[idx]}
                  className="hover:scale-105 transition-transform duration-200"
                />
              ))}
            </Pie>
            <RechartTooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              formatter={val => <span className="text-sm text-gray-700">{val}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default BiasPieChart;
