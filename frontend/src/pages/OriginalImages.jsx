import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OriginalImages.css';
import Header from '../components/Header';
import Button from '../components/Button';
import Modal from '../components/Modal';
import ImageBox from '../components/ImageBox';
import { useGlobalContext } from '../context/GlobalContext';
import LoadingDots from '../components/LoadingDots';
import { FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
const MAIN_ENDPOINT = import.meta.env.VITE_MAIN_ENDPOINT;
const BIAS_ANALYSIS_URL = import.meta.env.VITE_BIAS_ANALYSIS;

const OriginalImages = () => {
  const navigate = useNavigate();
  const {
    setAttributes, setOriginalImages,
    originalImages, attributes,
    originalSelections, setOriginalSelections,
    clearTransformedImages,
    mode, setMode,
    unverifiedUploads, setUnverifiedUploads,
    verifiedUploads, setVerifiedUploads
  } = useGlobalContext();

  // ==== State ====
  const [imageToDelete, setImageToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [base64Uploads, setBase64Uploads] = useState([]);
  const [alertMessage, setAlertMessage] = useState(null);
  const [confirmIndex, setConfirmIndex] = useState(null);
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [selections, setSelections] = useState(originalSelections || { gender: '', age: '', race: '' });
  const [pendingNumImages, setPendingNumImages] = useState(originalSelections?.numImages || 1);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  // ==== Refs ====
  const fileInputRef = useRef(null);
  const prevModeRef = useRef(mode);

  // ==== Effects ====
  useEffect(() => {
    if (prevModeRef.current !== mode) {
      setOriginalImages([]);
      setUnverifiedUploads([]);
      setVerifiedUploads([]);
      setSelections([]);
      setPendingNumImages(1);
      setHasGenerated(false);
      setAlertMessage(null);
      setIsValidated(false);
      clearTransformedImages();
      prevModeRef.current = mode;
    }

    if (
      mode === 'custom' &&
      verifiedUploads.length > 0 &&
      unverifiedUploads.length === 0 &&
      verifiedUploads.every(img => img.has_face === true)
    ) {
      setIsValidated(true);
    }
  }, [mode]);

  useEffect(() => {
    if (
      mode === 'custom' &&
      verifiedUploads.length > 0 &&
      unverifiedUploads.length === 0 &&
      verifiedUploads.every(img => img.has_face === true)
    ) {
      setIsValidated(true);
    } else {
      setIsValidated(false); // <== ADD THIS LINE
    }
  }, [verifiedUploads, unverifiedUploads, mode]);

  useEffect(() => {
    if (mode === 'default' && originalImages.length > 0) {
      setHasGenerated(true);
    }
  }, [originalImages, mode]);

  useEffect(() => {
    if (
      mode === 'custom' &&
      verifiedUploads.length > 0 &&
      unverifiedUploads.length === 0 &&
      verifiedUploads.every(img => img.has_face === true)
    ) {
      setIsValidated(true);
    }
  }, [verifiedUploads, unverifiedUploads, mode]);

  // ==== Utility ====
  const formatLabel = (value) => ({
    Black: 'Black',
    EastAsian: 'East Asian',
    White: 'White'
  }[value] || value);

  const updateSelection = (field, value) => {
    setSelections(prev => ({ ...prev, [field]: value }));
  };

  const compressImage = (file, maxSize = 600, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = () => {
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > height && width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          } else if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ==== Handlers ====
  const openFileDialog = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validImageTypes.includes(file.type));
    const gifFiles = files.filter(file => file.type === 'image/gif');

    if (gifFiles.length > 0) {
      setAlertMessage('GIF format is not supported. Please upload JPEG or PNG images.');
      return;
    }

    if (invalidFiles.length > 0) {
      setAlertMessage('Some files are not valid image formats (JPEG, PNG, or WebP only).');
      return;
    }

    const uploads = await Promise.all(
      files.map(async file => ({
        name: file.name,
        url: await compressImage(file)
      }))
    );

    setUnverifiedUploads(prev => [...uploads, ...prev]);
    setBase64Uploads(prev => [...uploads.map(u => ({ ...u })), ...prev]);
    setIsValidated(false);
    clearTransformedImages();
  };

  const confirmRegenerate = async () => {
    if (confirmIndex === null) return;

    setLoadingIndex(confirmIndex);
    setShowDeleteConfirm(false);
    clearTransformedImages();

    try {
      const response = await axios.post(`${MAIN_ENDPOINT}/refresh-image`, {
        images: originalImages,
        replace: originalImages[confirmIndex]
      });

      const updated = [...originalImages];
      updated[confirmIndex] = response.data.replacement;
      setOriginalImages(updated);
    } catch (err) {
      console.error(err);
      setAlertMessage('Failed to regenerate image. Please try again.');
    } finally {
      setLoadingIndex(null);
      setConfirmIndex(null);
    }
  };

  const handleGenerate = async () => {
    if (mode === 'custom') {
      if (unverifiedUploads.length + verifiedUploads.length === 0) {
        setAlertMessage('Please upload at least one image.');
        return;
      }
      setAttributes({ gender: 'undefined', age: 'undefined', race: 'undefined' });
      setOriginalImages([...verifiedUploads, ...unverifiedUploads]);
      setHasGenerated(true);
      clearTransformedImages();
      return;
    }

    if (!selections.gender || !selections.age || !selections.race) {
      setAlertMessage('Please select gender, age, and race.');
      return;
    }

    if (hasGenerated) {
      setShowRegenerateConfirm(true);
      return;
    }

    await generateImages(); // separate logic into a helper
  };

  const generateImages = async () => {
    try {
      setIsGenerating(true);

      const tempPlaceholders = Array.from({ length: pendingNumImages }, (_, i) => ({
        name: `loading-${i}`,
        url: '',
        isLoading: true
      }));
      setOriginalImages(tempPlaceholders);
      setHasGenerated(true);

      const response = await axios.post(`${MAIN_ENDPOINT}/get-random-images`, {
        ...selections,
        num: pendingNumImages
      });

      const images = response.data.images;
      setAttributes(selections);
      setOriginalSelections({ ...selections, numImages: pendingNumImages });
      setOriginalImages(images);
      clearTransformedImages();
    } catch (err) {
      console.error(err);
        setAlertMessage('Failed to fetch images. Try again.');
        const failedImages = Array.from({ length: pendingNumImages }, (_, i) => ({
        name: `error-${i}`,
        url: '',
        isLoading: false,
        failed: true
      }));
      setOriginalImages(failedImages);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = async () => {
    if (mode === 'default') {
      if (!originalImages || originalImages.length === 0 || originalImages.every(img => img.isLoading || !img.url)) {
        setAlertMessage('Please generate images before proceeding.');
        return;
      }

      navigate('/transformed');
      return;
    }

    const combinedImages = [...verifiedUploads, ...unverifiedUploads];
    setOriginalImages(combinedImages);
    setAttributes({ gender: 'undefined', age: 'undefined', race: 'undefined' });

    if (isValidated) {
      navigate('/transformed');
      return;
    }

    if (unverifiedUploads.length === 0) {
      setAlertMessage('Please upload at least one image before continuing.');
      setIsValidated(false);
      return;
    }

    try {
      setIsValidating(true);
      const uploadRes = await axios.post(`${MAIN_ENDPOINT}/upload-images`, {
        images: unverifiedUploads.map(img => ({ base64: img.url }))
      });

      const finalImages = uploadRes.data.uploaded;
      const checkRes = await axios.post(`${BIAS_ANALYSIS_URL}/check_faces`, {
        images: finalImages
      });

      const verified = checkRes.data.map(img => ({
        name: img.name,
        url: finalImages.find(f => f.name === img.name)?.url || '',
        has_face: img.has_face
      }));

      setVerifiedUploads(prev => [...prev, ...verified]);
      setUnverifiedUploads([]);
      setBase64Uploads([]);
      setOriginalImages([...verifiedUploads, ...verified]);

      const hasInvalid = verified.some(img => !img.has_face);

      if (hasInvalid) {
        setAlertMessage('Some images do not contain faces. Please review them.');
        setIsValidated(false);
      } else {
        setIsValidated(true);
      }
    } catch (err) {
      console.error(err);
      setAlertMessage('Image upload or validation failed. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  // ==== Render ====
  const allUploads = mode === 'default'
    ? originalImages
    : [...verifiedUploads, ...unverifiedUploads];

  return (
    <div className="original-wrapper">
      <Header mode={mode} setMode={setMode} />

      {mode === 'default' && (
        <div className="filter-panel">
          <div className="filter-inner">
            <div className="filter-options-group">
              {['gender', 'age', 'race'].map(field => {
                const opts = field === 'gender'
                  ? ['Female', 'Male']
                  : field === 'age'
                    ? ['20-29', '40-49', '60-69']
                    : ['Black', 'White', 'EastAsian'];
                return (
                  <div className="filter-group" key={field}>
                    <div className="filter-title">{field.charAt(0).toUpperCase() + field.slice(1)}</div>
                    <div className="button-group">
                      {opts.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          className={`toggle-btn ${selections[field] === opt ? 'active' : ''}`}
                          onClick={() => updateSelection(field, opt)}
                        >
                          {formatLabel(opt)}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              <div className="filter-group slider-group">
                <label className="filter-title">Number of images per prompt</label>
                <div className="slider-wrapper">
                  <span className="slider-value">{pendingNumImages}</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={pendingNumImages}
                    onChange={(e) => setPendingNumImages(Number(e.target.value))}
                  />
                  <div className="slider-labels">
                    <span>1</span>
                    <span>5</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="button-wrapper-right">
              <Button label="Generate" onClick={handleGenerate} disabled={isGenerating} />
            </div>
          </div>
        </div>
      )}

      <div className="output-box">
        <div className="preview-box">
          {hasGenerated && mode === 'default' && (
            <div className="summary-text">
              <p>{pendingNumImages} Images of {formatLabel(selections.race)} {selections.gender} aged {selections.age}</p>
            </div>
          )}

          <div className="images-grid">
            {allUploads.map((img, i) => {
              let icon = null;
              if (mode !== 'default') {
                if (img.has_face === true) icon = <FaCheckCircle color="green" title="Face detected" size={24} />;
                else if (img.has_face === false) icon = <FaExclamationCircle color="red" title="No face detected" size={24} />;
                else icon = <FaExclamationCircle color="orange" title="Unverified" size={24} />;
              }
              return (
                <ImageBox
                  key={i}
                  imageUrl={img.url}
                  icon={
                    img.failed ? (
                      <FaExclamationCircle color="red" title="Failed to load" size={24} />
                    ) : icon
                  }
                  isLoading={img.isLoading || loadingIndex === i} // ✅ check loading flag
                  onClick={() => {
                    if (mode === 'default') {
                      setConfirmIndex(i);
                    } else {
                      setImageToDelete(img.name);
                    }
                    setShowDeleteConfirm(true);
                  }}
                />
              );
            })}
            {mode === 'custom' && allUploads.length < 5 && (
              <ImageBox isUploadButton onClick={openFileDialog} />
            )}
          </div>

          {allUploads.length > 0 && (
            <p className="regenerate-hint">
              *Click on image to {mode === 'default' ? 'regenerate' : 'remove uploaded image'}
            </p>
          )}

          {isValidating && (
            <div className="generating-overlay">
              <div className="message">Validating<LoadingDots /></div>
            </div>
          )}

          {!hasGenerated && mode === 'default' && (
            <p className="no-selection">No attributes selected.</p>
          )}

          <input
            type="file"
            multiple
            accept="image/*"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        <div className="button-row-bottom">
          <Button label="Back" onClick={() => navigate('/')} disabled={isGenerating}/>
          <Button label={mode === 'custom' && !isValidated ? 'Validate' : 'Next'} onClick={handleNext} disabled={isGenerating}/>
        </div>
      </div>

      {showDeleteConfirm && (
        <Modal
          type="confirm"
          message={
            mode === 'default'
              ? 'Are you sure you want to regenerate this image?'
              : 'Are you sure you want to remove this uploaded image?'
          }
          onConfirm={() => {
            if (mode === 'default') {
              confirmRegenerate();
            } else {
              setUnverifiedUploads(prev => prev.filter(img => img.name !== imageToDelete));
              setVerifiedUploads(prev => prev.filter(img => img.name !== imageToDelete));
              setBase64Uploads(prev => prev.filter(img => img.name !== imageToDelete));
              setIsValidated(false);
              setShowDeleteConfirm(false);
              setImageToDelete(null);
              clearTransformedImages();
            }
          }}
          onClose={() => {
            setShowDeleteConfirm(false);
            setImageToDelete(null);
            setConfirmIndex(null);
          }}
        />
      )}

      {showRegenerateConfirm && (
        <Modal
          type="confirm"
          message="Regenerating will overwrite existing images. Continue?"
          onConfirm={() => {
            setShowRegenerateConfirm(false);
            generateImages();
          }}
          onClose={() => setShowRegenerateConfirm(false)}
        />
      )}

      {alertMessage && (
        <Modal type="alert" message={alertMessage} onClose={() => setAlertMessage(null)} />
      )}
    </div>
  );
};

export default OriginalImages;