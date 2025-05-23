import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import BiasCard from './BiasCard';
import Tooltip from './Tooltip';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ResultsGrid = ({ data }) => {
  const groupResultsByOccupation = () => {
    const grouped = {};

    data.transform.forEach(transform => {
      const occupation = transform.occupation;

      transform.images.forEach(image => {
        // find the matching original record
        // (no change here)
        const originalImage = data.originals.find(o => o.name === image.original);
        if (!originalImage) return;

        // # COMMENT: stop parsing the UUID as a number—just strip “.jpg” and keep it as a string
        const imageName = String(image.original.replace(/\.(?:jpg|png)$/i, ''));

        // Extract metrics now matching on string imageName
        const ageBiasEntry   = data.age_bias_matrix.find(entry   => String(entry.image_name) === imageName);
        const genderBiasEntry= data.gender_bias_matrix.find(entry  => String(entry.image_name) === imageName);
        const raceBiasEntry  = data.race_bias_matrix?.find(entry   => String(entry.image_name) === imageName);
        const metricEntry    = data.metrics?.[occupation]?.find(entry=> String(entry.image_name) === imageName);

        const ageBias     = ageBiasEntry?.[occupation]         ?? 0;
        const genderBias  = genderBiasEntry?.[occupation]      ?? 0;
        const raceBias    = raceBiasEntry?.[occupation]        ?? 0;

        const pair = {
          occupation,
          ageBias,
          genderBias,
          raceBias,
          originalAge:      metricEntry?.original_age      ?? null,
          transformedAge:   metricEntry?.transformed_age   ?? null,
          originalGender:   metricEntry?.original_gender   ?? null,
          transformedGender:metricEntry?.transformed_gender?? null,
          originalAPD:      Number(parseFloat(metricEntry?.original_avg_darkness)).toFixed(2)   ?? null,
          transformedAPD:   Number(parseFloat(metricEntry?.transformed_avg_darkness)).toFixed(2)?? null,
          genderFlag:       metricEntry?.gender_flag       ?? 0,
          imagePair: {
            originalImage:    originalImage.url,
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
      <div className="flex items-center gap-2 mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Detailed Analysis by Occupation</h2>
        <Tooltip content="Each original-predicted image pair is grouped by occupation for better analysis" />
      </div>

      {Object.entries(groupedResults).map(([occupation, pairs], groupIndex) => {
        const scrollRef = useRef(null);

        return (
          <div key={occupation} className="mb-10">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4">{occupation}</h3>

            {pairs.length > 3 && (
              <div className="flex justify-end gap-2 mb-2">
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
                  className="min-w-[350px] h-[510px] flex-shrink-0"
                  initial={{ opacity: 0, y: 20 }}
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
