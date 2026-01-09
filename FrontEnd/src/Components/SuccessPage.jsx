import React from "react";
import { Icons } from "./Icons";
import '../styles/success.css';  

export default function SuccessPage({ 
  billNo, 
  onExport, 
  onShare, 
  onNewBill, 
  title = "Bill Saved Successfully", // Default title
  subtitle // Optional custom subtitle
}) {
  return (
    <div className="success-container">
      <div className="success-icon-wrapper">
        <Icons.Check style={{ width: 40, height: 40, color: '#16a34a' }} />
      </div>
      
      <h2 className="success-title">{title}</h2>
      <p className="success-subtitle">
        {subtitle || `Bill #${billNo} has been saved to database.`}
      </p>

      <div className="success-actions">
        <div className="action-label">📂 EXPORT</div>
        <div className="action-row">
          <button onClick={() => onExport('pdf')} className="btn-outline">
            <Icons.PDF /> PDF
          </button>
          <button onClick={() => onExport('img')} className="btn-outline">
            <Icons.Image /> Image
          </button>
        </div>

        <div className="action-label">🔗 SHARE</div>
        <button onClick={onShare} className="btn-full-blue">
          <Icons.Share /> Share Receipt
        </button>

        <div className="action-label">✨ NEXT</div>
        {/* Dynamic button text based on context */}
        <button onClick={onNewBill} className="btn-full-dark">
          <Icons.Plus /> {title.includes("Return") ? "Create New Return" : "Create New Bill"}
        </button>
      </div>
    </div>
  );
}