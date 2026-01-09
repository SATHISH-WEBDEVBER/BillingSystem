import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import BillPreview from './BillPreview';
import '../styles/home.css'; 
import '../styles/history.css'; 

export default function HistoryPage({ onViewBill }) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'new'); 
  
  const [allBills, setAllBills] = useState([]);
  const [allReturns, setAllReturns] = useState([]); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'new') fetchBills();
    if (activeTab === 'return') fetchReturns();
  }, [activeTab]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/bills/all');
      setAllBills(res.data);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/returns/all');
      setAllReturns(res.data);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  return (
    <div className="history-container">
      
      <div className="history-header">
        <h2>History</h2>
        <div className="history-tabs">
          <button className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>
            Generated Bills
          </button>
          <button className={`tab-btn ${activeTab === 'return' ? 'active' : ''}`} onClick={() => setActiveTab('return')}>
            Return Generated Bills
          </button>
          <button className={`tab-btn ${activeTab === 'updated' ? 'active' : ''}`} onClick={() => setActiveTab('updated')}>
            Updated Bills
          </button>
        </div>
      </div>

      <div className="history-content">
        {loading && <div style={{padding:20}}>Loading...</div>}

        {/* --- TAB 1: BILLS --- */}
        {!loading && activeTab === 'new' && (
          <div className="bills-grid">
            {allBills.map((bill) => (
               <div key={bill._id} className="bill-card" onClick={() => onViewBill(bill)}>
                  <div className="card-preview">
                    <div className="mini-bill-wrapper">
                      <BillPreview data={{...bill, billDate: bill.date, clientName: bill.client.name, clientMobile: bill.client.mobile, clientAddress: bill.client.address}} items={bill.items} totals={bill.totals} />
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="card-row-1"><span className="card-client">{bill.client.name}</span><span className="card-amount">₹{bill.totals?.netAmount}</span></div>
                    <div className="card-row-2"><span className="card-id">#{bill.billNo}</span><span>{bill.date}</span></div>
                  </div>
               </div>
            ))}
          </div>
        )}

        {/* --- TAB 2: RETURNS --- */}
        {!loading && activeTab === 'return' && (
          <div className="bills-grid">
            {allReturns.length > 0 ? allReturns.map((ret) => (
               // ADDED onClick HERE
               <div key={ret._id} className="bill-card" onClick={() => onViewBill(ret)}>
                  <div className="card-preview">
                    <div className="mini-bill-wrapper">
                      <BillPreview 
                        data={{
                            billNo: ret.returnId, 
                            billDate: ret.returnDate, 
                            clientName: ret.client.name, 
                            clientMobile: ret.client.mobile, 
                            clientAddress: ret.client.address,
                            paymentMode: "Return Note"
                        }} 
                        items={ret.items} 
                        totals={ret.totals} 
                      />
                    </div>
                  </div>
                  <div className="card-footer" style={{borderTop:'2px solid #f87171'}}>
                    <div className="card-row-1"><span className="card-client">{ret.client.name}</span><span className="card-amount" style={{color:'#dc2626'}}>- ₹{ret.totals?.netAmount}</span></div>
                    <div className="card-row-2"><span className="card-id" style={{background:'#fef2f2', color:'#991b1b'}}>Ret #{ret.returnId}</span><span>{ret.returnDate}</span></div>
                  </div>
               </div>
            )) : <div className="empty-state">No returns found.</div>}
          </div>
        )}

        {!loading && activeTab === 'updated' && <div className="empty-state"><h3>✏️ Updated Bills</h3></div>}

      </div>
    </div>
  );
}