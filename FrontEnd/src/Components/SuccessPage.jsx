import React from 'react';
import { Icons } from './Icons';
import '../styles/success.css'; 

export default function SuccessPage({ billNo, onExport, onShare, onNewBill }) {
  return (
    <div className="success-wrapper">
      <div className="success-card">
        <div className="success-icon-box">
          <Icons.Check />
        </div>
        <h3 style={{margin: "0 0 5px 0", color:"#166534"}}>Bill Saved Successfully</h3>
        <p style={{ color: "#64748b", margin: "0 0 20px 0", fontSize:"14px" }}>
          Bill <b>#{billNo}</b> has been saved to database.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          
          {/* Export */}
          <div className="action-box">
            <h4 className="box-title">📂 Export</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => onExport('pdf')} className="btn-action">
                <Icons.PDF /> PDF
              </button>
              <button onClick={() => onExport('img')} className="btn-action">
                <Icons.Image /> Image
              </button>
            </div>
          </div>

          {/* Share */}
          <div className="action-box">
            <h4 className="box-title">🔗 Share</h4>
            <button onClick={onShare} className="btn-blue">
              <Icons.Share /> Share Bill
            </button>
          </div>

          {/* Next */}
          <div className="action-box">
            <h4 className="box-title">✨ Next</h4>
            <button onClick={onNewBill} className="btn-black">
              <Icons.Refresh /> Create New Bill
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}