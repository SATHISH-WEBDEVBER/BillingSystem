import React from 'react';
import { useNavigate } from 'react-router-dom';
import BillPreview from './BillPreview';
import { Icons } from './Icons';
import '../styles/detail.css';

export default function BillDetail({ bill, onExport, onShare, onEdit, onDelete }) {
  const navigate = useNavigate();

  if (!bill) return null;

  // --- LOGIC: Detect if this is a Return or a Normal Bill ---
  const isReturn = bill.returnId !== undefined;
  
  // Normalize Data for Display
  const displayData = {
    id: isReturn ? bill.returnId : bill.billNo,
    type: isReturn ? "Return Note" : "Invoice",
    date: isReturn ? bill.returnDate : bill.date,
    client: bill.client.name,
    // Map fields for BillPreview
    billNo: isReturn ? bill.returnId : bill.billNo,
    billDate: isReturn ? bill.returnDate : bill.date,
    clientName: bill.client.name,
    clientMobile: bill.client.mobile,
    clientAddress: bill.client.address,
    paymentMode: isReturn ? "Return Note" : "Credit", 
    shopMobile: "6385278892"
  };

  const elementId = "detail-preview-content";

  return (
    <div className="detail-container">
      
      {/* HEADER */}
      <div className="detail-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <span>←</span> Back
          </button>
          <div>
            <h2 className="bill-title">{displayData.type} #{displayData.id}</h2>
            <p className="bill-subtitle">{displayData.client} • {displayData.date}</p>
          </div>
        </div>

        <div className="header-actions">
          {/* Edit Button - Now available for Returns too */}
          <button className="action-btn" onClick={() => onEdit(bill)}>
            <span style={{color:'#2563eb'}}>✎</span> Edit
          </button>
          
          <button className="action-btn" onClick={() => onDelete(bill._id)} style={{color:'#dc2626', borderColor:'#fecaca'}}>
            <span>🗑️</span> Delete
          </button>

          <div style={{width:'1px', background:'#e2e8f0', margin:'0 5px'}}></div>

          <button className="action-btn" onClick={() => onExport('pdf', elementId)}>
            <Icons.PDF /> PDF
          </button>
          <button className="action-btn" onClick={() => onExport('img', elementId)}>
            <Icons.Image /> Image
          </button>
          <button className="action-btn btn-primary" onClick={onShare}>
            <Icons.Share /> Share
          </button>
        </div>
      </div>

      {/* VIEWPORT */}
      <div className="bill-viewport">
        <div id={elementId} className="document-wrapper">
          <BillPreview 
            data={displayData} 
            items={bill.items} 
            totals={bill.totals} 
          />
        </div>
      </div>

    </div>
  );
}