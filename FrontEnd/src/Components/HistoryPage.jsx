import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import BillPreview from './BillPreview';
import '../styles/home.css'; 
import '../styles/history.css'; 

// Page to display the history of all transactions (Invoices, Returns, Updated Bills)
export default function HistoryPage({ onViewBill, refreshTrigger }) {
  const location = useLocation();
  // Initialize the active tab based on navigation state (default to 'new')
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'new'); 
  
  // State variables to store lists of bills fetched from the backend
  const [allBills, setAllBills] = useState([]);
  const [allReturns, setAllReturns] = useState([]); 
  const [allUpdated, setAllUpdated] = useState([]); 
  const [loading, setLoading] = useState(false);

  // --- REFRESH LOGIC ---
  // Added 'refreshTrigger' to the dependency array.
  // When App.jsx says "data changed" (refreshTrigger++), this runs again to fetch fresh data.
  useEffect(() => {
    if (activeTab === 'new') fetchBills();
    if (activeTab === 'return') fetchReturns();
    if (activeTab === 'updated') fetchUpdated();
  }, [activeTab, refreshTrigger]); 

  // Function to fetch standard sales bills
  const fetchBills = async () => {
    setLoading(true);
    try { const res = await axios.get('http://localhost:5000/api/bills/all'); setAllBills(res.data); } catch (e) {}
    setLoading(false);
  };

  // Function to fetch return transactions
  const fetchReturns = async () => {
    setLoading(true);
    try { const res = await axios.get('http://localhost:5000/api/returns/all'); setAllReturns(res.data); } catch (e) {}
    setLoading(false);
  };

  // Function to fetch updated bills (final bills after returns)
  const fetchUpdated = async () => {
    setLoading(true);
    try { const res = await axios.get('http://localhost:5000/api/updated/all'); setAllUpdated(res.data); } catch (e) {}
    setLoading(false);
  };

  return (
    <div className="history-container">
      {/* Header with Navigation Tabs */}
      <div className="history-header">
        <h2>History</h2>
        <div className="history-tabs">
          <button className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`} onClick={() => setActiveTab('new')}>Generated Bills</button>
          <button className={`tab-btn ${activeTab === 'return' ? 'active' : ''}`} onClick={() => setActiveTab('return')}>Return Generated Bills</button>
          <button className={`tab-btn ${activeTab === 'updated' ? 'active' : ''}`} onClick={() => setActiveTab('updated')}>Updated Final Bills</button>
        </div>
      </div>

      {/* Content Area: Displays the grid of bills based on the selected tab */}
      <div className="history-content">
        {loading && <div style={{padding:20}}>Loading...</div>}

        {/* 1. Standard Bills Tab */}
        {!loading && activeTab === 'new' && (
          <div className="bills-grid">
            {allBills.map((bill) => (
               <div key={bill._id} className="bill-card" onClick={() => onViewBill(bill)}>
                  <div className="card-preview"><div className="mini-bill-wrapper"><BillPreview data={{...bill, billDate: bill.date, clientName: bill.client.name, paymentMode: "Credit"}} items={bill.items} totals={bill.totals} /></div></div>
                  <div className="card-footer"><div className="card-row-1"><span className="card-client">{bill.client.name}</span><span className="card-amount">₹{bill.totals?.netAmount}</span></div><div className="card-row-2"><span className="card-id">#{bill.billNo}</span><span>{bill.date}</span></div></div>
               </div>
            ))}
          </div>
        )}

        {/* 2. Return Bills Tab */}
        {!loading && activeTab === 'return' && (
          <div className="bills-grid">
            {allReturns.map((ret) => (
               <div key={ret._id} className="bill-card" onClick={() => onViewBill(ret)}>
                  <div className="card-preview"><div className="mini-bill-wrapper"><BillPreview data={{billNo: ret.returnId, billDate: ret.returnDate, clientName: ret.client.name, paymentMode: "Return Note"}} items={ret.items} totals={ret.totals} /></div></div>
                  {/* Distinct styling for returns (Red borders/text) */}
                  <div className="card-footer" style={{borderTop:'2px solid #f87171'}}><div className="card-row-1"><span className="card-client">{ret.client.name}</span><span style={{color:'#dc2626'}}>- ₹{ret.totals?.netAmount}</span></div><div className="card-row-2"><span className="card-id" style={{background:'#fef2f2', color:'#991b1b'}}>Ret #{ret.returnId}</span><span>{ret.returnDate}</span></div></div>
               </div>
            ))}
          </div>
        )}

        {/* 3. Updated Bills Tab */}
        {!loading && activeTab === 'updated' && (
          <div className="bills-grid">
            {allUpdated.map((upd) => (
               <div key={upd._id} className="bill-card" onClick={() => onViewBill(upd)}>
                  <div className="card-preview"><div className="mini-bill-wrapper"><BillPreview data={{billNo: upd.updatedBillId, billDate: upd.date, clientName: upd.client.name, paymentMode: "Final Bill"}} items={upd.items} totals={upd.totals} /></div></div>
                  {/* Distinct styling for updated bills (Blue borders/text) */}
                  <div className="card-footer" style={{borderTop:'2px solid #3b82f6'}}><div className="card-row-1"><span className="card-client">{upd.client.name}</span><span style={{color:'#2563eb'}}>₹{upd.totals?.netAmount}</span></div><div className="card-row-2"><span className="card-id" style={{background:'#eff6ff', color:'#1d4ed8'}}>{upd.updatedBillId}</span><span>{upd.date}</span></div></div>
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}