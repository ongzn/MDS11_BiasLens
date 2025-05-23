import React, { useState } from 'react';
import { Group } from '@visx/group';
import { scaleLinear, scalePoint } from '@visx/scale';
import { motion } from 'framer-motion';

/**
 * DumbbellChart with race bias, smooth animations, no lines
 */
const DumbbellChart = ({ width, height, data, filter = 'both' }) => {
  const margin = { top: 40, right: 140, bottom: 40, left: 140 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const chartData = Object.keys(data.metrics)
    .map((occupation) => {
      const genderAvg =
        data.gender_bias_matrix.reduce((acc, entry) => acc + (entry[occupation] || 0), 0) /
        data.gender_bias_matrix.length;
      const ageAvg =
        data.age_bias_matrix.reduce((acc, entry) => acc + (entry[occupation] || 0), 0) /
        data.age_bias_matrix.length;
      const raceAvg =
        data.race_bias_matrix.reduce((acc, entry) => acc + (entry[occupation] || 0), 0) /
        data.race_bias_matrix.length;

      return {
        name: occupation,
        genderBias: Math.min(genderAvg, 1),
        ageBias: Math.min(ageAvg, 1),
        raceBias: Math.min(raceAvg, 1),
        average: (genderAvg + ageAvg + raceAvg) / 3,
      };
    })
    .sort((a, b) => b.average - a.average);

  const xScale = scaleLinear({ domain: [0, 1], range: [0, innerWidth] });
  const yScale = scalePoint({
    domain: chartData.map((d) => d.name),
    range: [0, innerHeight],
    padding: 0.5,
  });

  const [hovered, setHovered] = useState(null);

  return (
    <svg width={width} height={height}>
      <Group top={margin.top} left={margin.left}>
        {/* X Axis Grid & Labels */}
        {xScale.ticks(5).map((tick) => (
          <Group key={tick}>
            <line
              x1={xScale(tick)}
              x2={xScale(tick)}
              y1={0}
              y2={innerHeight}
              stroke="#E5E7EB"
              strokeDasharray="4,4"
            />
            <text
              x={xScale(tick)}
              y={innerHeight + 20}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              {(tick * 100).toFixed(0)}%
            </text>
          </Group>
        ))}

        {/* Y Axis Occupation Labels */}
        {chartData.map((d) => (
          <text
            key={d.name}
            x={-10}
            y={yScale(d.name)}
            textAnchor="end"
            dominantBaseline="middle"
            className="text-sm fill-gray-700 font-medium"
          >
            {d.name}
          </text>
        ))}

        {/* Bias Points */}
        {chartData.map((d, index) => {
          const y = yScale(d.name);
          const genderX = xScale(d.genderBias);
          const ageX = xScale(d.ageBias);
          const raceX = xScale(d.raceBias);

          return (
            <Group key={d.name}>
              {/* Gender Bias */}
              {(filter === 'gender' || filter === 'both' || filter === 'all') && (
                <>
                  <motion.circle
                    cx={genderX}
                    cy={y}
                    r={hovered === d.name ? 8 : 6}
                    fill="#4F46E5"
                    onMouseEnter={() => setHovered(d.name)}
                    onMouseLeave={() => setHovered(null)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  />
                  {hovered === d.name && (
                    <text x={genderX - 12} y={y - 12} fontSize={10} fill="#4F46E5">
                      {(d.genderBias * 100).toFixed(1)}%
                    </text>
                  )}
                </>
              )}

              {/* Age Bias */}
              {(filter === 'age' || filter === 'both' || filter === 'all') && (
                <>
                  <motion.circle
                    cx={ageX}
                    cy={y}
                    r={hovered === d.name ? 8 : 6}
                    fill="#06B6D4"
                    onMouseEnter={() => setHovered(d.name)}
                    onMouseLeave={() => setHovered(null)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 + 0.05 }}
                  />
                  {hovered === d.name && (
                    <text x={ageX + 10} y={y - 12} fontSize={10} fill="#06B6D4">
                      {(d.ageBias * 100).toFixed(1)}%
                    </text>
                  )}
                </>
              )}

              {/* Race Bias (Orange) */}
              {(filter === 'race' || filter === 'both' || filter === 'all') && (
                <>
                  <motion.circle
                    cx={raceX}
                    cy={y}
                    r={hovered === d.name ? 8 : 6}
                    fill="#F97316"
                    onMouseEnter={() => setHovered(d.name)}
                    onMouseLeave={() => setHovered(null)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                  />
                  {hovered === d.name && (
                    <text x={raceX + 10} y={y + 15} fontSize={10} fill="#F97316">
                      {(d.raceBias * 100).toFixed(1)}%
                    </text>
                  )}
                </>
              )}
            </Group>
          );
        })}
      </Group>
    </svg>
  );
};

export default DumbbellChart;
