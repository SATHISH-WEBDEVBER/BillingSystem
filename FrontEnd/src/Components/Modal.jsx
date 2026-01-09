import React from 'react';
import '../styles/modal.css';

export default function Modal({ 
  isOpen, 
  type, 
  title, 
  message, 
  onConfirm, 
  onClose,
  confirmText = "Confirm", // Default text
  cancelText = "Cancel"    // Default text
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {/* Header with Icon */}
        <div className={`modal-header ${type}`}>
          {type === 'confirm' && <span style={{fontSize: "24px", marginRight:"10px"}}>⚠️</span>}
          {type === 'success' && <span style={{fontSize: "24px", marginRight:"10px"}}>✅</span>}
          {type === 'error' && <span style={{fontSize: "24px", marginRight:"10px"}}>❌</span>}
          {type === 'choice' && <span style={{fontSize: "24px", marginRight:"10px"}}>ℹ️</span>} {/* New Icon */}
          
          <h3>{title}</h3>
        </div>

        <div className="modal-body">
          <p>{message}</p>
        </div>

        <div className="modal-footer">
          
          {/* CONFIRMATION MODE (Delete Action) */}
          {type === 'confirm' && (
            <>
              <button className="btn-modal-cancel" onClick={onClose}>
                {cancelText}
              </button>
              <button className="btn-modal-delete" onClick={onConfirm}>
                {confirmText === "Confirm" ? "Confirm Delete" : confirmText}
              </button>
            </>
          )}

          {/* CHOICE MODE (New for Returns) */}
          {type === 'choice' && (
            <>
              <button className="btn-modal-cancel" onClick={onClose}>
                {cancelText}
              </button>
              <button className="btn-modal-ok" onClick={onConfirm}>
                {confirmText}
              </button>
            </>
          )}

          {/* SUCCESS MODE */}
          {type === 'success' && (
            <button className="btn-modal-ok" onClick={onClose}>
              OK, Great
            </button>
          )}

          {/* ERROR MODE */}
          {type === 'error' && (
            <button className="btn-modal-cancel" onClick={onClose} style={{width:'100%', borderColor:'#991b1b', color:'#991b1b'}}>
              Okay, I'll Check
            </button>
          )}

        </div>

      </div>
    </div>
  );
}