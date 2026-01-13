import React from 'react';
import { useNavigate } from 'react-router-dom';
import BillPreview from './BillPreview';
import { Icons } from './Icons';
import '../styles/detail.css';

// Component to display the full details of a specific bill (Invoice, Return, or Updated)
export default function BillDetail({ bill, onExport, onShare, onEdit, onDelete }) {
  const navigate = useNavigate();
  // Guard clause: If no bill data is passed, do not render anything
  if (!bill) return null;

  // --- LOGIC: Detect Type ---
  // Check if this is an "Updated Bill" (created automatically after a return)
  const isUpdated = bill.updatedBillId !== undefined;
  // Check if this is a "Return Note" (but not an updated bill)
  const isReturn = bill.returnId !== undefined && !isUpdated;
  
  // Determine which ID to display based on the bill type
  const id = isUpdated ? bill.updatedBillId : (isReturn ? bill.returnId : bill.billNo);
  // Set the title label based on type
  const type = isUpdated ? "Updated Bill" : (isReturn ? "Return Note" : "Invoice");
  // Select the correct date field
  const date = bill.date || bill.returnDate; // Updated Bill uses 'date'

  // Map for Preview
  // Prepare the data object specifically for the BillPreview component
  const displayData = {
    billNo: id,
    billDate: date,
    clientName: bill.client.name,
    clientMobile: bill.client.mobile,
    clientAddress: bill.client.address,
    paymentMode: isUpdated ? "Final Bill" : (isReturn ? "Return Note" : "Credit"), 
    shopMobile: "6385278892"
  };

  // ID used by the export function to grab this specific HTML element for PDF/Image generation
  const elementId = "detail-preview-content";

  return (
    <div className="detail-container">
      {/* Header Section: Back button and Title */}
      <div className="detail-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}><span>←</span> Back</button>
          <div>
            <h2 className="bill-title">{type} #{id}</h2>
            <p className="bill-subtitle">{bill.client.name} • {date}</p>
          </div>
        </div>

        {/* Action Buttons: Edit, Delete, Export */}
        <div className="header-actions">
          {/* Edit/Delete forbidden for Updated Bills (Auto-generated) */}
          {/* Only show Edit for normal invoices (not updated, not return) */}
          {!isUpdated && !isReturn && <button className="action-btn" onClick={() => onEdit(bill)}><span style={{color:'#2563eb'}}>✎</span> Edit</button>}
          
          {/* Edit for Return Bills */}
          {isReturn && <button className="action-btn" onClick={() => onEdit(bill)}><span style={{color:'#2563eb'}}>✎</span> Edit</button>}

          {/* Delete allowed for Normal & Return (Updated deleted automatically) */}
          {/* Updated bills are managed by logic, so manual delete is disabled to prevent data mismatch */}
          {!isUpdated && <button className="action-btn" onClick={() => onDelete(bill._id)} style={{color:'#dc2626', borderColor:'#fecaca'}}><span>🗑️</span> Delete</button>}

          <div style={{width:'1px', background:'#e2e8f0', margin:'0 5px'}}></div>
          {/* Export Buttons */}
          <button className="action-btn" onClick={() => onExport('pdf', elementId)}><Icons.PDF /> PDF</button>
          <button className="action-btn" onClick={() => onExport('img', elementId)}><Icons.Image /> Image</button>
          <button className="action-btn btn-primary" onClick={onShare}><Icons.Share /> Share</button>
        </div>
      </div>

      {/* Viewport: The actual visual representation of the bill */}
      <div className="bill-viewport">
        <div id={elementId} className="document-wrapper">
          {/* Renders the receipt/invoice layout */}
          <BillPreview data={displayData} items={bill.items} totals={bill.totals} />
        </div>
      </div>
    </div>
  );
}