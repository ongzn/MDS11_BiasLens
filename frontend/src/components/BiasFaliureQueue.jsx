import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import FailureModal from '../components/FailureModel';

const BiasFailureQueue = ({ data }) => {
  const [selected, setSelected] = useState(null);

  if (!data?.bias_failures?.details?.length) return null;

  const failedItems = data.bias_failures.details.map(failure => {
    const original = data.originals.find(o =>
      o.name.replace(/\.(jpg|png)$/i, '') === String(failure.image_name)
    );

    return {
      imageUrl: original?.url ?? '',
      occupation: failure.occupation,
      imageName: failure.image_name
    };
  });

  return (
    <motion.div
      className="mb-10"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="text-red-600" />
        <h2 className="text-xl font-semibold text-red-600">
          ⚠️ Failed Bias Detection(s)
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {failedItems.map((item, idx) => (
          <motion.div
            key={idx}
            className="relative group bg-red-50 border-2 border-red-400 rounded-lg p-3 shadow-md hover:shadow-lg transition cursor-pointer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            onClick={() => setSelected(item)}
          >
            <motion.div
              className="absolute -inset-[2px] z-0 rounded-lg border-[2px] border-red-500 pointer-events-none"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />

            <div className="relative z-10">
              <div className="relative">
                <img
                  src={item.imageUrl}
                  alt={`Failed image ${item.imageName}`}
                  className="w-full h-[130px] object-cover rounded-md mb-3 filter grayscale"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 text-white text-sm font-semibold flex items-center justify-center rounded-md">
                  😵 Unable to Analyze
                </div>
              </div>

              <div className="text-sm font-medium text-gray-800 mb-1 text-center">
                {item.occupation}
              </div>
              <div className="text-xs text-center text-red-600 font-semibold">
                Bias Analysis Failed
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <FailureModal
            item={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BiasFailureQueue;
