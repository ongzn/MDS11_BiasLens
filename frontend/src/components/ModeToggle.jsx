import React from 'react';
import './ModeToggle.css';

const ModeToggle = ({ mode, setMode }) => {
  const isCustom = mode === 'custom';

  const handleToggle = () => {
    setMode(isCustom ? 'default' : 'custom');
  };

  return (
    <label className="mode-switch">
      <input type="checkbox" checked={isCustom} onChange={handleToggle} />
      <span className="slider">
        <span className="label-left">Default</span>
        <span className="label-right">Custom</span>
      </span>
    </label>
  );
};

export default ModeToggle;