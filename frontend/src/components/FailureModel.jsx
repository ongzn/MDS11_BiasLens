import React from 'react';
import { motion } from 'framer-motion';

const FailureModal = ({ item, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md relative"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-sm text-gray-500 hover:text-black"
        >
          ✖
        </button>

        <img
          src={item.imageUrl}
          alt={item.imageName}
          className="w-full h-[180px] object-cover rounded mb-4"
        />

        <h3 className="text-lg font-semibold text-red-600 mb-2">
          Bias Analysis Failed
        </h3>

        <p className="text-sm text-gray-700 mb-1">
          <strong>Image:</strong> {item.imageName}
        </p>
        <p className="text-sm text-gray-700 mb-1">
          <strong>Reason:</strong> Our model failed to detect any resemblance of a face in the picture.
        </p>
        <p className="text-sm text-gray-700">
          Try again with a different model or image that has a clearer frontal face.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default FailureModal;
