// TransformedImages.jsx
// This component allows users to select a model and occupations, generate AI-transformed face images, and calculate bias analysis.
// It supports real-time preview, progress tracking, and input validation using modal alerts.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TransformedImages.css';
import Header from '../components/Header';
import Button from '../components/Button';
import Modal from '../components/Modal';
import ImageBox from '../components/ImageBox';
import axios from 'axios';
import { useGlobalContext } from '../context/GlobalContext';
import LoadingDots from '../components/LoadingDots';
import { FaExclamationCircle } from 'react-icons/fa';

// Backend endpoint for transformation and analysis
const MAIN_ENDPOINT = import.meta.env.VITE_MAIN_ENDPOINT;

// Available occupations
const allOccupations = [
  'Doctor', 'Nurse', 'Engineer', 'Teacher', 'Software Developer',
  'Scientist', 'Police Officer', 'Firefighter', 'Soldier', 'Pilot',
  'Flight Attendant', 'Construction Worker', 'Mechanic', 'Chef', 'Artist',
  'Judge', 'Lawyer', 'Cashier', 'Receptionist', 'Secretary', 'Housekeeper',
  'Janitor', 'Preschool Teacher', 'Social Worker', 'Pharmacist'
];

const TransformedImages = () => {
  const navigate = useNavigate();
  const {
    attributes,
    originalImages,
    transformedImages, setTransformedImages,
    selectedModel: globalModel, setSelectedModel,
    selectedOccupations: globalOccupations, setSelectedOccupations,
    setOccupations,
    mode,
  } = useGlobalContext();

  // Local state for current selections and UI state
  const [localModel, setLocalModel] = useState(globalModel);
  const [localOccupations, setLocalOccupations] = useState(globalOccupations);
  const [localTransformed, setLocalTransformed] = useState({});
  const [generatedOccupations, setGeneratedOccupations] = useState([]);
  const [progress, setProgress] = useState({});
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('alert');

  // Navigate back if no original images are found, or restore saved transformed images
  useEffect(() => {
    if (!originalImages || originalImages.length === 0) {
      navigate('/original');
      return;
    }

    if (Object.keys(transformedImages).length > 0) {
      setLocalTransformed(transformedImages);
      setHasGenerated(true);
      setGeneratedOccupations(Object.keys(transformedImages));
    } else {
      setLocalTransformed({});
      setHasGenerated(false);
      setProgress({});
      setGeneratedOccupations([]);
      setLocalModel(globalModel);
      setLocalOccupations(globalOccupations);
    }
  }, [originalImages, transformedImages]);

  // Open modal with custom message and type
  const openModal = (msg, type = 'alert') => {
    setModalMessage(msg);
    setModalType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMessage('');
  };

  // Toggle occupation selection, with max of 3
  const toggleOccupation = (occ) => {
    const isSelected = localOccupations.includes(occ);
    if (!isSelected && localOccupations.length >= 3) {
      openModal('You can only select up to 3 occupations.');
      return;
    }
    setLocalOccupations(prev =>
      isSelected ? prev.filter(o => o !== occ) : [...prev, occ]
    );
  };

  // Map selected model to API endpoint
  const getModelApiUrl = (model) => {
    const endpoints = {
      'InstructPix2Pix': `${MAIN_ENDPOINT}/transform-image`,
      'Img2Img': `${MAIN_ENDPOINT}/transform-img2img`,
      'MagicBrush': `${MAIN_ENDPOINT}/transform-magicbrush`
    };
    return endpoints[model] || null;
  };

  // Main button handler for image generation
  const handleGenerate = () => {
    if (!localModel) return openModal('Please select a model.');
    if (localOccupations.length === 0) return openModal('Please select at least one occupation.');
    if (hasGenerated) {
      setShowConfirmReset(true);
    } else {
      executeGenerate();
    }
  };

  // Main generation logic: loops over images for each occupation
  const executeGenerate = async () => {
    setIsGenerating(true);
    setHasGenerated(true);
    setSelectedModel(localModel);
    setSelectedOccupations(localOccupations);
    setOccupations(localOccupations);
    setGeneratedOccupations(localOccupations);
    setLocalTransformed({});

    const placeholder = {};
    const progressInit = {};
    localOccupations.forEach(o => progressInit[o] = 0);

    for (const occ of localOccupations) {
      placeholder[occ] = originalImages.map((img, i) => ({
        original: img.url,
        transformed: '',
        isLoading: true,
        key: `loading-${occ}-${i}`
      }));
    }
    setLocalTransformed(placeholder);
    setProgress(progressInit);

    const apiUrl = getModelApiUrl(localModel);
    const transformedResult = {};

    for (const occ of localOccupations) {
      transformedResult[occ] = [];

      for (let i = 0; i < originalImages.length; i++) {
        const img = originalImages[i];
        try {
          const res = await axios.post(apiUrl, {
            occupation: occ,
            images: { name: img.name, url: img.url }
          }, {
            timeout: 15000000000
          });

          const transformedUrl = res.data.transform.images.base64
            ? `data:image/png;base64,${res.data.transform.images.base64}`
            : res.data.transform.images.url || '';

          const newImg = {
            occupation: occ,
            original: img.url,
            transformed: transformedUrl,
            isLoading: false,
            key: `final-${occ}-${i}`
          };

          transformedResult[occ].push(newImg);

          setLocalTransformed(prev => {
            const index = prev[occ].findIndex(item => item.original === img.url);
            if (index === -1) return prev;
            const updated = [...prev[occ]];
            updated[index] = newImg;
            return { ...prev, [occ]: updated };
          });

          setProgress(prev => ({ ...prev, [occ]: prev[occ] + 1 }));
        } catch (err) {
          console.error(`❌ Failed to transform image ${img.name} for ${occ}`, err);

          const failedTransformed = {};
          const failedProgress = {};

          for (const o of localOccupations) {
            failedTransformed[o] = originalImages.map((img, idx) => ({
              occupation: o,
              original: img.url,
              transformed: '',
              isLoading: false,
              failed: true,
              key: `failed-${o}-${idx}`
            }));
            failedProgress[o] = originalImages.length;
          }

          setLocalTransformed(failedTransformed);
          setProgress(failedProgress);

          openModal(`Image failed to transform due to high traffic. Process halted.`, 'alert');
          setIsGenerating(false);
          return;
        }
      }
    }

    setTransformedImages(transformedResult);
    setIsGenerating(false);
  };

  // Trigger bias analysis API once images are transformed
  const handleCalculate = async () => {
    if (!hasGenerated || generatedOccupations.length === 0) {
      return openModal('Please generate transformed images before calculating.');
    }

    const failedOccupations = generatedOccupations.filter(occ => {
      const images = localTransformed[occ] || [];
      const validCount = images.filter(img => img.transformed).length;
      return validCount < originalImages.length;
    });

    if (failedOccupations.length > 0) {
      openModal(
        `Some images failed to transform. Please regenerate before analyzing.`,
        'alert'
      );
      return;
    }

    const payload = {
      gender: attributes.gender,
      age: attributes.age,
      race: attributes.race,
      num: originalImages.length,
      occupation: generatedOccupations,
      originals: originalImages.map(img => ({ name: img.name, url: img.url })),
      transform: generatedOccupations.map(occ => ({
        occupation: occ,
        images: (localTransformed[occ] || [])
          .filter(img => img.transformed)
          .map(img => ({
            original: img.original.split('/').pop().split('?')[0],
            url: img.transformed
          }))
      }))
    };

    try {
      setIsCalculating(true);
      const res = await axios.post(`${MAIN_ENDPOINT}/analyze-bias`, payload);
      navigate('/result', { state: { result: res.data } });
    } catch (err) {
      console.error('Bias analysis failed:', err);
      openModal('Bias analysis failed.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="transformed-wrapper">
      {/* Top header bar */}
      <Header />

      {/* Model and occupation filter panel */}
      <div className="filter-panel-1">
        <div className="filter-inner">
          <div className="filter-options-group">
            {/* Model selection area */}
            <div className="model-group">
              <label className="filter-title">Model</label>
              <div className="radio-options">
                {[ // Predefined image generation models
                  { name: 'InstructPix2Pix', time: '~1.5 min per image' },
                  { name: 'Img2Img', time: '~3 min per image' },
                  { name: 'MagicBrush', time: '~3.5 min per image' }
                ].map(({ name, time }) => (
                  <label key={name} className="model-option">
                    <input
                      type="radio"
                      name="model"
                      value={name}
                      checked={localModel === name}
                      onChange={(e) => {
                        const selected = e.target.value;
                        setLocalModel(selected);
                        // Show warning for Img2Img which is experimental
                        if (selected === 'Img2Img') {
                          openModal('⚠️ Not recommended. Note that selected models are currently experimental and could suffer from performance issues.', 'alert');
                        }
                      }}
                      disabled={isGenerating} // Disable during generation
                    />
                    <span className="model-label">{name} <span className="model-time">({time})</span></span>
                  </label>
                ))}
              </div>
            </div>

            {/* Occupation checkbox selector (max 3 allowed) */}
            <div className="checkbox-group">
              <label className="filter-title">Occupation (Max:3)</label>
              <div className="checkbox-grid">
                {allOccupations.map((occ) => (
                  <label key={occ} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={localOccupations.includes(occ)}
                      onChange={() => toggleOccupation(occ)}
                      disabled={isGenerating || (!localOccupations.includes(occ) && localOccupations.length >= 3)}
                    />
                    {occ}
                  </label>
                ))}
              </div>

              {/* Optional custom occupation input (commented out) */}
              {/* {mode === 'custom' && (
                <div className="custom-occupation-input">
                  <input
                    type="text"
                    placeholder="Enter custom occupation"
                    value={customOccupation}
                    onChange={(e) => setCustomOccupation(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddCustomOccupation();
                    }}
                  />
                  <Button
                    label="Add"
                    onClick={handleAddCustomOccupation}
                    disabled={localOccupations.length >= 5}
                    className={localOccupations.length >= 5 ? 'disabled-add-btn' : ''}
                  />
                </div>
              )} */}

              {/* Optional occupation removal pills (commented out) */}
              {/* {mode === 'custom' && localOccupations.length > 0 && (
                <div className="selected-occupations-pill-row">
                  {localOccupations.map((occ) => (
                    <span key={occ} className="occupation-pill">
                      {occ}
                      <button
                        className="remove-pill-btn"
                        onClick={() => handleRemoveOccupation(occ)}
                        disabled={isGenerating || isCalculating}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )} */}
            </div>
          </div>

          {/* Generate button aligned right */}
          <div className="button-wrapper-right">
            <Button label="Generate" onClick={handleGenerate} disabled={isGenerating || isCalculating} />
          </div>
        </div>
      </div>

      {/* Output section: either preview of generated images or no selection message */}
      <div className="output-box">
        {hasGenerated ? (
          <div className="preview-box">
            {/* Summary of demographic filters if in default mode */}
            {mode === 'default' && attributes && (
              <div className="summary-text">
                <p>
                  Selected Demographics: &nbsp;
                  <strong>{attributes.gender || '-'}</strong> | &nbsp;
                  <strong>{attributes.age || '-'}</strong> | &nbsp;
                  <strong>{attributes.race || '-'}</strong>
                </p>
              </div>
            )}

            {/* Display each occupation section with transformed image results */}
            {generatedOccupations.map(occ => (
              <div key={occ} className="occupation-section">
                <p className="occupation-title">
                  {occ}{' '}
                  {isGenerating && (
                    <span className="generating-status">
                      (Generating images<LoadingDots /> {progress[occ] || 0}/{originalImages.length} completed)
                    </span>
                  )}
                </p>
                <div className="images-grid">
                  {(localTransformed[occ] || []).map((img, i) => (
                    <ImageBox
                      key={img.key || i}
                      imageUrl={img.transformed}
                      isLoading={img.isLoading}
                      icon={img.failed ? (
                        <FaExclamationCircle color="red" title="Transformation failed" size={24} />
                      ) : null}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-selection">No occupation selected.</p>
        )}

        {/* Bottom navigation buttons */}
        <div className="button-row-bottom">
          <Button label="Back" onClick={() => navigate('/original')} disabled={isGenerating || isCalculating} />
          <Button label="Calculate" onClick={handleCalculate} disabled={isGenerating || isCalculating} />
        </div>
      </div>

      {/* Modal for alerts and warnings */}
      {showModal && (
        <Modal type={modalType} message={modalMessage} onClose={closeModal} />
      )}

      {/* Confirmation modal before overwriting transformations */}
      {showConfirmReset && (
        <Modal
          type="confirm"
          message="This will regenerate and overwrite all existing transformed images. Proceed?"
          onConfirm={() => {
            setShowConfirmReset(false);
            executeGenerate();
          }}
          onClose={() => setShowConfirmReset(false)}
        />
      )}

      {/* Optional: overlay during image generation or bias analysis (commented out) */}
      {/* {(isCalculating || isGenerating) && (
        <div className="generating-overlay">
          <div className="message">
            {isGenerating ? (() => {
              const total = originalImages.length * localOccupations.length;
              const completed = Object.values(progress).reduce((sum, val) => sum + val, 0);
              return (
                <>
                  Generating ({completed} / {total})<LoadingDots />
                </>
              );
            })() : (
              <>Analyzing<LoadingDots /></>
            )}
          </div>
        </div>
      )} */}

      {/* Bias analysis overlay */}
      {isCalculating && (
        <div className="generating-overlay">
          <div className="message">
            Analyzing<LoadingDots />
          </div>
        </div>
      )}
    </div>
  );
}