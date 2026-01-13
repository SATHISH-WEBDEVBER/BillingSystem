import React from 'react';
import '../styles/modal.css';

// Reusable Modal component for Alerts, Confirmations, and Choices
export default function Modal({ 
  isOpen, 
  type, // 'confirm', 'success', 'error', or 'choice'
  title, 
  message, 
  onConfirm, 
  onClose,
  confirmText = "Confirm", // Default text if not provided
  cancelText = "Cancel"    // Default text if not provided
}) {
  // If the modal is not open, render nothing (return null)
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        
        {/* Header with Icon based on the 'type' prop */}
        <div className={`modal-header ${type}`}>
          {type === 'confirm' && <span style={{fontSize: "24px", marginRight:"10px"}}>⚠️</span>}
          {type === 'success' && <span style={{fontSize: "24px", marginRight:"10px"}}>✅</span>}
          {type === 'error' && <span style={{fontSize: "24px", marginRight:"10px"}}>❌</span>}
          {type === 'choice' && <span style={{fontSize: "24px", marginRight:"10px"}}>ℹ️</span>} {/* New Icon for decision modals */}
          
          <h3>{title}</h3>
        </div>

        {/* Main message body */}
        <div className="modal-body">
          <p>{message}</p>
        </div>

        <div className="modal-footer">
          
          {/* CONFIRMATION MODE (Usually for Delete Actions) */}
          {/* Renders a Cancel button and a Danger/Confirm button */}
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

          {/* CHOICE MODE (New for Returns/Edits) */}
          {/* Renders a Cancel button and a Primary Action button */}
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
          {/* Renders a single button to dismiss the success message */}
          {type === 'success' && (
            <button className="btn-modal-ok" onClick={onClose}>
              OK, Great
            </button>
          )}

          {/* ERROR MODE */}
          {/* Renders a single button to dismiss the error alert */}
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