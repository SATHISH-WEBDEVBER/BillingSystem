import React from 'react';
import { useNavigate } from 'react-router-dom';
import BillPreview from './BillPreview';
import { Icons } from './Icons';
import '../styles/detail.css';

export default function BillDetail({ bill, onExport, onShare, onEdit, onDelete }) {
  const navigate = useNavigate();
  if (!bill) return null;

  // --- LOGIC: Detect Type ---
  const isUpdated = bill.updatedBillId !== undefined;
  const isReturn = bill.returnId !== undefined && !isUpdated;
  
  const id = isUpdated ? bill.updatedBillId : (isReturn ? bill.returnId : bill.billNo);
  const type = isUpdated ? "Updated Bill" : (isReturn ? "Return Note" : "Invoice");
  const date = bill.date || bill.returnDate; 

  // FIXED: Logic for Terms/PaymentMode display
  // 1. If it's an Updated/Final Bill -> "Final Bill"
  // 2. Else -> Use the stored paymentMode (Cash/UPI/Credit)
  // 3. Fallback -> "Credit"
  const paymentModeDisplay = isUpdated 
    ? "Final Bill" 
    : (bill.paymentMode || "Credit");

  // Map for Preview
  const displayData = {
    billNo: id,
    billDate: date,
    clientName: bill.client.name,
    clientMobile: bill.client.mobile,
    clientAddress: bill.client.address,
    paymentMode: paymentModeDisplay, // Using fixed logic
    shopMobile: "6385278892"
  };

  const elementId = "detail-preview-content";

  return (
    <div className="detail-container">
      <div className="detail-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}><span>←</span> Back</button>
          <div>
            <h2 className="bill-title">{type} #{id}</h2>
            <p className="bill-subtitle">{bill.client.name} • {date}</p>
          </div>
        </div>

        <div className="header-actions">
          {/* Edit/Delete forbidden for Updated Bills (Auto-generated) */}
          {!isUpdated && !isReturn && <button className="action-btn" onClick={() => onEdit(bill)}><span style={{color:'#2563eb'}}>✎</span> Edit</button>}
          
          {/* Edit for Return Bills */}
          {isReturn && <button className="action-btn" onClick={() => onEdit(bill)}><span style={{color:'#2563eb'}}>✎</span> Edit</button>}

          {/* Delete allowed for Normal & Return (Updated deleted automatically) */}
          {!isUpdated && <button className="action-btn" onClick={() => onDelete(bill._id)} style={{color:'#dc2626', borderColor:'#fecaca'}}><span>🗑️</span> Delete</button>}

          <div style={{width:'1px', background:'#e2e8f0', margin:'0 5px'}}></div>
          <button className="action-btn" onClick={() => onExport('pdf', elementId)}><Icons.PDF /> PDF</button>
          <button className="action-btn" onClick={() => onExport('img', elementId)}><Icons.Image /> Image</button>
          <button className="action-btn btn-primary" onClick={onShare}><Icons.Share /> Share</button>
        </div>
      </div>

      <div className="bill-viewport">
        <div id={elementId} className="document-wrapper">
          <BillPreview data={displayData} items={bill.items} totals={bill.totals} />
        </div>
      </div>
    </div>
  );
}