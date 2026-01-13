import React from "react";
import { Icons } from "./Icons";
import '../styles/success.css';  

// Component to display a success message screen after a transaction is completed
export default function SuccessPage({ 
  billNo, 
  onExport, 
  onShare, 
  onNewBill, 
  title = "Bill Saved Successfully", // Default title if none provided
  subtitle // Optional custom subtitle
}) {
  return (
    <div className="success-container">
      {/* Visual Success Indicator (Green Checkmark Icon) */}
      <div className="success-icon-wrapper">
        <Icons.Check style={{ width: 40, height: 40, color: '#16a34a' }} />
      </div>
      
      {/* Dynamic Title and Subtitle Display */}
      <h2 className="success-title">{title}</h2>
      <p className="success-subtitle">
        {/* If subtitle prop exists, use it; otherwise default to showing the Bill ID */}
        {subtitle || `Bill #${billNo} has been saved to database.`}
      </p>

      <div className="success-actions">
        {/* Section 1: Buttons to download the bill as PDF or Image */}
        <div className="action-label">📂 EXPORT</div>
        <div className="action-row">
          <button onClick={() => onExport('pdf')} className="btn-outline">
            <Icons.PDF /> PDF
          </button>
          <button onClick={() => onExport('img')} className="btn-outline">
            <Icons.Image /> Image
          </button>
        </div>

        {/* Section 2: Button to trigger the native share dialog */}
        <div className="action-label">🔗 SHARE</div>
        <button onClick={onShare} className="btn-full-blue">
          <Icons.Share /> Share Receipt
        </button>

        {/* Section 3: Button to reset state and start a new transaction */}
        <div className="action-label">✨ NEXT</div>
        {/* Dynamic button text based on context */}
        {/* Logic: If this was a Return transaction, show "Create New Return", else "Create New Bill" */}
        <button onClick={onNewBill} className="btn-full-dark">
          <Icons.Plus /> {title.includes("Return") ? "Create New Return" : "Create New Bill"}
        </button>
      </div>
    </div>
  );
}