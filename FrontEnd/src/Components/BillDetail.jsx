import React from 'react';
import { useNavigate } from 'react-router-dom'; // NEW: Routing Hook
import BillPreview from './BillPreview';
import { Icons } from './Icons';
import '../styles/detail.css'; // Use new CSS

export default function BillDetail({ bill, onExport, onShare, onGenerateNew }) {
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
      
      {/* 1. PROFESSIONAL HEADER */}
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
          <button onClick={() => onExport('pdf', 'bill-view-detail')} className="action-btn">
            <Icons.PDF /> PDF
          </button>
          <button onClick={() => onExport('img', 'bill-view-detail')} className="action-btn">
            <Icons.Image /> Image
          </button>
          <button onClick={onShare} className="action-btn btn-primary">
            <Icons.Share /> Share
          </button>
          <button onClick={onGenerateNew} className="action-btn" style={{color:"#2563eb", borderColor:"#2563eb"}}>
            <Icons.Plus /> New Bill
          </button>
        </div>
      </div>

      {/* 2. CENTERED DOCUMENT VIEW */}
      <div className="bill-viewport">
        <div id="bill-view-detail" className="document-wrapper">
           <BillPreview data={data} items={bill.items} totals={bill.totals} />
        </div>
      </div>

    </div>
  );
}