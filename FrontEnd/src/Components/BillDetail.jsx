import React from 'react';
import { useNavigate } from 'react-router-dom';
import BillPreview from './BillPreview';
import { Icons } from './Icons';
import '../styles/detail.css'; 

export default function BillDetail({ bill, onExport, onShare, onEdit, onDelete }) {
  const navigate = useNavigate();

  if (!bill) return <div style={{padding:40}}>Loading Bill...</div>;

  const data = {
    billNo: bill.billNo,
    billDate: bill.date,
    clientName: bill.client.name,
    clientAddress: bill.client.address,
    clientMobile: bill.client.mobile,
    paymentMode: "Credit",
    shopMobile: "6385278892"
  };

  return (
    <div className="detail-container">
      
      {/* HEADER */}
      <div className="detail-header">
        <div className="header-left">
          <button onClick={() => navigate(-1)} className="back-btn">
             ← Back
          </button>
          <div>
            <h2 className="bill-title">Invoice #{bill.billNo}</h2>
            <p className="bill-subtitle">{bill.client.name} • {bill.date}</p>
          </div>
        </div>

        <div className="header-actions">
          {/* Edit */}
          <button onClick={() => onEdit(bill)} className="action-btn" style={{color:"#2563eb", borderColor:"#2563eb"}}>
             Edit Bill
          </button>

          {/* Delete (Just calls parent function, Modal is handled in App.jsx) */}
          <button onClick={() => onDelete(bill._id)} className="action-btn" style={{color:"#ef4444", borderColor:"#ef4444"}}>
             <Icons.Trash /> Delete
          </button>

          <div style={{width:1, height:20, background:'#e2e8f0', margin:'0 5px'}}></div>

          <button onClick={() => onExport('pdf', 'bill-view-detail')} className="action-btn">
            <Icons.PDF /> PDF
          </button>
          <button onClick={() => onExport('img', 'bill-view-detail')} className="action-btn">
            <Icons.Image /> Image
          </button>
          <button onClick={onShare} className="action-btn btn-primary">
            <Icons.Share /> Share
          </button>
        </div>
      </div>

      {/* DOCUMENT VIEW */}
      <div className="bill-viewport">
        <div id="bill-view-detail" className="document-wrapper">
           <BillPreview data={data} items={bill.items} totals={bill.totals} />
        </div>
      </div>

    </div>
  );
}