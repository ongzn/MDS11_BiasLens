import React, { createContext, useContext, useState } from 'react';

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }) => {
  const [attributes, setAttributes] = useState(null);
  const [originalImages, setOriginalImages] = useState([]);
  const [transformedImages, _setTransformedImages] = useState(() => {
    const stored = sessionStorage.getItem('transformedImages');
    return stored ? JSON.parse(stored) : {};
  });

  const setTransformedImages = (data) => {
    _setTransformedImages(data);
    if (data && Object.keys(data).length > 0) {
      sessionStorage.setItem('transformedImages', JSON.stringify(data));
    } else {
      sessionStorage.removeItem('transformedImages');
    }
  };

  const clearTransformedImages = () => {
    _setTransformedImages({});
    sessionStorage.removeItem('transformedImages');
    setSelectedModel('');
    setSelectedOccupations([]);
    setOccupations([]);
  };

  const [occupations, setOccupations] = useState([]);
  const [originalSelections, setOriginalSelections] = useState({
    gender: '', age: '', race: '', numImages: 1,
  });
  const [unverifiedUploads, setUnverifiedUploads] = useState([]);
  const [verifiedUploads, setVerifiedUploads] = useState([]);
  const [customUploads, setCustomUploads] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedOccupations, setSelectedOccupations] = useState([]);

  const [mode, setMode] = useState('default');

  return (
    <GlobalContext.Provider
      value={{
        attributes, setAttributes,
        originalImages, setOriginalImages,
        transformedImages, setTransformedImages, clearTransformedImages,
        occupations, setOccupations,
        originalSelections, setOriginalSelections,
        selectedModel, setSelectedModel,
        selectedOccupations, setSelectedOccupations,
        mode, setMode,
        customUploads, setCustomUploads,
        unverifiedUploads, setUnverifiedUploads,
        verifiedUploads, setVerifiedUploads,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};