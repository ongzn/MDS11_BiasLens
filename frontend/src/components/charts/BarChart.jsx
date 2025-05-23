import React from 'react';
import { Group } from '@visx/group';
import { scaleLinear, scaleBand } from '@visx/scale';
import { motion } from 'framer-motion';

const BarChart = ({ width, height, data, filter = 'both' }) => {
  const margin = { top: 40, right: 40, bottom: 60, left: 140 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const chartData = Object.keys(data.metrics)
    .map((occupation) => {
      const genderAvg = data.gender_bias_matrix.reduce((acc, d) => acc + (d[occupation] || 0), 0) / data.gender_bias_matrix.length;
      const ageAvg = data.age_bias_matrix.reduce((acc, d) => acc + (d[occupation] || 0), 0) / data.age_bias_matrix.length;
      const raceAvg = data.race_bias_matrix?.reduce((acc, d) => acc + (d[occupation] || 0), 0) / data.race_bias_matrix.length;

      return {
        name: occupation,
        genderBias: Math.min(genderAvg, 1),
        ageBias: Math.min(ageAvg, 1),
        raceBias: Math.min(raceAvg, 1)
      };
    })
    .sort((a, b) => {
      const getVal = (d) =>
        filter === 'age' ? d.ageBias :
        filter === 'gender' ? d.genderBias :
        filter === 'race' ? d.raceBias :
        (d.genderBias + d.ageBias + d.raceBias) / 3;
      return getVal(b) - getVal(a);
    });

  const yScale = scaleBand({
    domain: chartData.map(d => d.name),
    range: [0, innerHeight],
    padding: 0.4,
  });

  const xScale = scaleLinear({
    domain: [0, 1],
    range: [0, innerWidth],
  });

  const barHeight = yScale.bandwidth();

  return (
    <svg width={width} height={height}>
      <Group top={margin.top} left={margin.left}>
        {xScale.ticks(5).map(tick => (
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

        {chartData.map(d => (
          <text
            key={d.name}
            x={-10}
            y={yScale(d.name) + barHeight / 2}
            textAnchor="end"
            dominantBaseline="middle"
            className="text-sm fill-gray-700 font-medium"
          >
            {d.name}
          </text>
        ))}

        {chartData.map((d, i) => {
          const y = yScale(d.name);
          const bars = [];

          if (filter === 'gender' || filter === 'both') {
            bars.push(
              <motion.rect
                key={`gender-${d.name}`}
                x={0}
                y={y}
                height={barHeight / 3}
                initial={{ width: 0 }}
                animate={{ width: xScale(d.genderBias) }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                fill="#4F46E5"
                rx={4}
                title={`Gender Bias: ${(d.genderBias * 100).toFixed(1)}%`}
              />
            );
          }

          if (filter === 'age' || filter === 'both') {
            bars.push(
              <motion.rect
                key={`age-${d.name}`}
                x={0}
                y={filter === 'both' ? y + barHeight / 3.2 : y}
                height={barHeight / 3}
                initial={{ width: 0 }}
                animate={{ width: xScale(d.ageBias) }}
                transition={{ duration: 0.6, delay: i * 0.05 + 0.05 }}
                fill="#06B6D4"
                rx={4}
                title={`Age Bias: ${(d.ageBias * 100).toFixed(1)}%`}
              />
            );
          }

          if (filter === 'race' || filter === 'both') {
            bars.push(
              <motion.rect
                key={`race-${d.name}`}
                x={0}
                y={
                  filter === 'both'
                    ? y + (2 * barHeight) / 3.2
                    : y
                }
                height={barHeight / 3}
                initial={{ width: 0 }}
                animate={{ width: xScale(d.raceBias) }}
                transition={{ duration: 0.6, delay: i * 0.05 + 0.1 }}
                fill="#F97316"
                rx={4}
                title={`Race Bias: ${(d.raceBias * 100).toFixed(1)}%`}
              />
            );
          }

          return bars;
        })}
      </Group>
    </svg>
  );
};

export default BarChart;
