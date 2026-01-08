import React from 'react';
import '../styles/modal.css';

export default function Modal({ isOpen, type, title, message, onConfirm, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        <div className={`modal-header ${type}`}>
          {/* Icon based on type */}
          {type === 'confirm' ? (
            <span style={{fontSize: "24px", marginRight:"10px"}}>⚠️</span>
          ) : (
            <span style={{fontSize: "24px", marginRight:"10px"}}>✅</span>
          )}
          <h3>{title}</h3>
        </div>

        <div className="modal-body">
          <p>{message}</p>
        </div>

        <div className="modal-footer">
          {type === 'confirm' ? (
            <>
              <button className="btn-modal-cancel" onClick={onClose}>
                Cancel
              </button>
              <button className="btn-modal-delete" onClick={onConfirm}>
                Confirm Delete
              </button>
            </>
          ) : (
            <button className="btn-modal-ok" onClick={onClose}>
              OK, Got it
            </button>
          )}
        </div>

      </div>
    </div>
  );
}