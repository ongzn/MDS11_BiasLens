import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import BiasCard from './BiasCard';
import Tooltip from './Tooltip';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ResultsGrid = ({ data }) => {
  const groupResultsByOccupation = () => {
    const grouped = {};
    console.log(`Fetched Data: ${JSON.stringify(data, null, 2)}`);

    data.transform.forEach(transform => {
      const occupation = transform.occupation;

      transform.images.forEach(image => {
        const originalImage = data.originals.find(o => o.name === image.original);
        if (!originalImage) return;

        const imageName = String(image.original.replace(/\.(?:jpg|png)$/i, ''));

        const ageBiasEntry    = data.age_bias_matrix.find(entry => String(entry.image_name) === imageName);
        const genderBiasEntry = data.gender_bias_matrix.find(entry => String(entry.image_name) === imageName);
        const raceBiasEntry   = data.race_bias_matrix?.find(entry => String(entry.image_name) === imageName);
        const metricEntry     = data.metrics?.[occupation]?.find(entry => String(entry.image_name) === imageName);

        const ageBias     = ageBiasEntry?.[occupation] ?? 0;
        const genderBias  = genderBiasEntry?.[occupation] ?? 0;
        const raceBias    = raceBiasEntry?.[occupation] ?? 0;

        const pair = {
          occupation,
          ageBias,
          genderBias,
          raceBias,
          originalAge: metricEntry?.original_age ?? null,
          transformedAge: metricEntry?.transformed_age ?? null,
          originalGender: metricEntry?.original_gender ?? null,
          transformedGender: metricEntry?.transformed_gender ?? null,
          originalAPD: Number(parseFloat(metricEntry?.original_avg_darkness)).toFixed(2) ?? null,
          transformedAPD: Number(parseFloat(metricEntry?.transformed_avg_darkness)).toFixed(2) ?? null,
          genderFlag: metricEntry?.gender_flag ?? 0,
          imagePair: {
            originalImage: originalImage.url,
            transformedImage: image.url
          }
        };

        if (!grouped[occupation]) {
          grouped[occupation] = [];
        }

        grouped[occupation].push(pair);
      });
    });

    return grouped;
  };

  const groupedResults = groupResultsByOccupation();

  const scrollBy = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === 'right' ? 400 : -400,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-0 pb-6">
      <div className="flex items-center gap-2 mb-4 pt-4">
        <h2 className="text-2xl font-bold text-black-800">Detailed Analysis by Occupation</h2>
        <Tooltip content="Each pair of images shows the original and AI-transformed version, organized by occupation. Hover over the metrics to explore detailed changes and bias scores for each individual." />
      </div>

      {Object.entries(groupedResults).map(([occupation, pairs]) => {
        const scrollRef = useRef(null);

        return (
          <div key={occupation} className="mb-6">
            <h3 className="text-lg font-semibold text-black-700 mb-4">{occupation}</h3>
            {pairs.length > 2 && (
              <div className="flex justify-end gap-2 -mt-14 mb-2">
                <button
                  className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                  onClick={() => scrollBy(scrollRef, 'left')}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                  onClick={() => scrollBy(scrollRef, 'right')}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            <motion.div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scrollbar-hide pb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {pairs.map((result, index) => (
                <motion.div
                  key={index}
                  className="min-w-[350px] h-[520px] flex-shrink-0 bg-transparent"
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <BiasCard
                    occupation={result.occupation}
                    genderBias={result.genderBias}
                    ageBias={result.ageBias}
                    raceBias={result.raceBias}
                    imagePairs={[result.imagePair]}
                    index={index + 1}
                    originalAge={result.originalAge}
                    transformedAge={result.transformedAge}
                    originalGender={result.originalGender}
                    transformedGender={result.transformedGender}
                    originalAPD={result.originalAPD}
                    transformedAPD={result.transformedAPD}
                    genderFlag={result.genderFlag}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

export default ResultsGrid;