import React from 'react';
import './Modal.css';

const Modal = ({ type = 'alert', message, onClose, onConfirm }) => {
  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header alert">
          <h3 className="modal-title">
            {type === 'confirm' ? 'Confirmation' : 'Alert'}
          </h3>
        </div>
        <p className="modal-message">{message}</p>
        <div className="modal-buttons">
          {type === 'confirm' ? (
            <>
              <button className="modal-btn cancel" onClick={onClose}>Cancel</button>
              <button className="modal-btn confirm" onClick={onConfirm}>Yes</button>
            </>
          ) : (
            <button className="modal-btn confirm" onClick={onClose}>OK</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;