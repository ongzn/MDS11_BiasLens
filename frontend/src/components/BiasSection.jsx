import React, { useState } from 'react';
import BiasChart from './BiasChart';
import BiasPieChart from './charts/BiasPieChart';
import BiasGaugeChart from './charts/BiasGaugeChart';

const BiasSection = ({ data }) => {
  const [view, setView] = useState('gauge'); // default = Progress Chart

  return (
    <div className="space-y-8">
      {/* Bar + Dumbbell chart always shown */}
      <BiasChart data={data} />

      {/* Toggle Button (Progress button FIRST) */}
      <div className="flex justify-center gap-4 mt-4">
       <button
        className={`text-sm px-4 py-2 rounded ${
          view === 'gauge'
            ? 'bg-[#333] text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        onClick={() => setView('gauge')}
      >
        View Progress Chart
      </button>
      <button
        className={`text-sm px-4 py-2 rounded ${
          view === 'pie'
            ? 'bg-[#333] text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        onClick={() => setView('pie')}
      >
        View Pie Chart
      </button>
      </div>

      {/* Render chart based on toggle (Progress shown first) */}
      {view === 'gauge' ? (
        <BiasGaugeChart data={data} />
      ) : (
        <BiasPieChart data={data} />
      )}
    </div>
  );
};

export default BiasSection;
