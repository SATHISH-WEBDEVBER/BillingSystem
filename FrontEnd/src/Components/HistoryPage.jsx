import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BillPreview from './BillPreview';
import '../styles/home.css'; // Reusing Card Styles
import '../styles/history.css'; // New Tab Styles

export default function HistoryPage({ onViewBill }) {
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'return', 'updated'
  const [allBills, setAllBills] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Bills when component loads
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // Calls the new /all route
      const res = await axios.get('http://localhost:5000/api/bills/all');
      setAllBills(res.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
    setLoading(false);
  };

  return (
    <div className="history-container">
      
      {/* 1. HEADER & TABS */}
      <div className="history-header">
        <h2>Bill History</h2>
        
        <div className="history-tabs">
          <button 
            className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`} 
            onClick={() => setActiveTab('new')}
          >
            New Generated Bills
          </button>
          <button 
            className={`tab-btn ${activeTab === 'return' ? 'active' : ''}`} 
            onClick={() => setActiveTab('return')}
          >
            Return Generated Bills
          </button>
          <button 
            className={`tab-btn ${activeTab === 'updated' ? 'active' : ''}`} 
            onClick={() => setActiveTab('updated')}
          >
            Updated Bills
          </button>
        </div>
      </div>

      {/* 2. CONTENT AREA */}
      <div className="history-content">
        
        {loading && <div style={{padding:20}}>Loading history...</div>}

        {/* --- TAB 1: NEW GENERATED BILLS --- */}
        {!loading && activeTab === 'new' && (
          <div className="bills-grid">
            {allBills.length > 0 ? (
              allBills.map((bill) => {
                // Prepare Preview Data
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
                    {/* Desktop Thumbnail */}
                    <div className="card-preview">
                      <div className="mini-bill-wrapper">
                        <BillPreview data={previewData} items={bill.items} totals={bill.totals} />
                      </div>
                    </div>

                    {/* Info Footer */}
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
              })
            ) : (
              <div className="empty-state">No bills found.</div>
            )}
          </div>
        )}

        {/* --- TAB 2: RETURN BILLS (Future) --- */}
        {!loading && activeTab === 'return' && (
          <div className="empty-state">
            <h3>↩️ Returns Module</h3>
            <p>Return bill generation features will appear here.</p>
          </div>
        )}

        {/* --- TAB 3: UPDATED BILLS (Future) --- */}
        {!loading && activeTab === 'updated' && (
          <div className="empty-state">
            <h3>✏️ Updated Bills</h3>
            <p>Modified or corrected bills will appear here.</p>
          </div>
        )}

      </div>
    </div>
  );
}