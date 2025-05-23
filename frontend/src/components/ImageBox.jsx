import './ImageBox.css';
import { FaPlus } from 'react-icons/fa';

const ImageBox = ({ imageUrl, isLoading, onClick, style = {}, isUploadButton = false, icon = null }) => {
  return (
    <div
      className={`image-box ${isUploadButton ? 'upload-box' : ''}`}
      style={{
        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
        cursor: onClick ? 'pointer' : 'default',
        opacity: isLoading ? 0.5 : 1,
        ...style
      }}
      onClick={onClick}
    >
      {isUploadButton && (
        <div className="upload-icon">
          <FaPlus size={40} />
        </div>
      )}

      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}

      {icon && <div className="image-icon-overlay">{icon}</div>}
    </div>
  );
};

export default ImageBox;