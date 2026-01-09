import React from 'react';
import BillPreview from './BillPreview';
import '../styles/home.css';

export default function HomePage({ recentBills, recentReturns, onNavigate, onViewBill }) {
  
  return (
    <div className="home-container">
      
      {/* Hero Button */}
      <div className="hero-action" onClick={() => onNavigate('billing')}>
        <div className="hero-text">
          <h2>Create New Bill</h2>
          <p>Tap here to generate invoice</p>
        </div>
        <div className="hero-icon">+</div>
      </div>

      {/* --- SECTION 1: RECENT BILLS --- */}
      <div className="section-header">
        <h3 className="section-title">Recent Bills</h3>
        <button className="view-all-link" onClick={() => onNavigate('history', { state: { tab: 'new' } })}>
            View All
        </button>
      </div>

      <div className="bills-grid">
        {recentBills.length > 0 ? recentBills.map((bill) => {
          const previewData = {
            billNo: bill.billNo,
            billDate: bill.date,
            clientName: bill.client.name,
            clientAddress: bill.client.address,
            clientMobile: bill.client.mobile,
            paymentMode: "Credit",
            shopMobile: "6385278892"
          };

          return (
            <div key={bill._id} className="bill-card" onClick={() => onViewBill(bill)}>
              <div className="card-preview">
                <div className="mini-bill-wrapper">
                  <BillPreview data={previewData} items={bill.items} totals={bill.totals} />
                </div>
              </div>
              <div className="card-footer">
                <div className="card-row-1">
                    <span className="card-client">{bill.client.name}</span>
                    <span className="card-amount">₹{bill.totals?.netAmount || "0"}</span>
                </div>
                <div className="card-row-2">
                    <span className="card-id">#{bill.billNo}</span>
                    <span>{bill.date}</span>
                </div>
              </div>
            </div>
          );
        }) : <div style={{color:'#94a3b8', fontStyle:'italic'}}>No bills generated yet.</div>}
      </div>

      {/* --- SECTION 2: RECENT RETURNS --- */}
      <div className="section-header" style={{marginTop:'40px'}}>
        <h3 className="section-title">Recent Returns</h3>
        <button className="view-all-link" onClick={() => onNavigate('history', { state: { tab: 'return' } })}>
            View All
        </button>
      </div>

      <div className="bills-grid">
        {recentReturns && recentReturns.length > 0 ? recentReturns.map((ret) => {
          const previewData = {
            billNo: ret.returnId,
            billDate: ret.returnDate,
            clientName: ret.client.name,
            clientAddress: ret.client.address,
            clientMobile: ret.client.mobile,
            paymentMode: "Return Note",
            shopMobile: "6385278892"
          };

          return (
            // ADDED onClick HERE
            <div key={ret._id} className="bill-card" onClick={() => onViewBill(ret)}>
              <div className="card-preview">
                <div className="mini-bill-wrapper">
                  <BillPreview data={previewData} items={ret.items} totals={ret.totals} />
                </div>
              </div>
              <div className="card-footer" style={{borderTop:'2px solid #f87171'}}>
                <div className="card-row-1">
                    <span className="card-client">{ret.client.name}</span>
                    <span className="card-amount" style={{color:'#dc2626'}}>- ₹{ret.totals?.netAmount || "0"}</span>
                </div>
                <div className="card-row-2">
                    <span className="card-id" style={{background:'#fef2f2', color:'#991b1b'}}>Ret #{ret.returnId}</span>
                    <span>{ret.returnDate}</span>
                </div>
              </div>
            </div>
          );
        }) : <div style={{color:'#94a3b8', fontStyle:'italic', padding:'20px', border:'1px dashed #ccc', borderRadius:'8px', width:'100%'}}>No return bills found.</div>}
      </div>
      
    </div>
  );
}