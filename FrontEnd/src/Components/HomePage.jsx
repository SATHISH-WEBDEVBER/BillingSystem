import React from 'react';
import BillPreview from './BillPreview';
import '../styles/home.css';

export default function HomePage({ recentBills, onNavigate, onViewBill }) {
  
  return (
    <div className="home-container">
      
      {/* Hero */}
      <div className="hero-action" onClick={() => onNavigate('billing')}>
        <div className="hero-text">
          <h2>Create New Bill</h2>
          <p>Tap here to generate invoice</p>
        </div>
        <div className="hero-icon">+</div>
      </div>

      {/* Header */}
      <div className="section-header">
        <h3 className="section-title">Recent Transactions</h3>
        <button className="view-all-link" onClick={() => onNavigate('history')}>View All</button>
      </div>

      {/* Bills List / Grid */}
      <div className="bills-grid">
        {recentBills.map((bill) => {
          
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
              
              {/* Desktop Only: Thumbnail */}
              <div className="card-preview">
                <div className="mini-bill-wrapper">
                  <BillPreview data={previewData} items={bill.items} totals={bill.totals} />
                </div>
              </div>

              {/* Info Area (Both) */}
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
        })}
      </div>
      
      <button className="btn-show-more" onClick={() => onNavigate('history')}>
         View More Bills
      </button>

    </div>
  );
}