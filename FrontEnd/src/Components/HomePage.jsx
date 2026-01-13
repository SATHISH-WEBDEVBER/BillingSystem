import React from 'react';
import BillPreview from './BillPreview';
import '../styles/home.css';

// The main landing page component showing quick actions and recent activity
export default function HomePage({ recentBills, recentReturns, recentUpdated, onNavigate, onViewBill }) {
  
  return (
    <div className="home-container">
      
      {/* Hero Button: The primary call-to-action to start a new billing process */}
      <div className="hero-action" onClick={() => onNavigate('billing')}>
        <div className="hero-text">
          <h2>Create New Bill</h2>
          <p>Tap here to generate invoice</p>
        </div>
        <div className="hero-icon">+</div>
      </div>

      {/* 1. RECENT BILLS SECTION */}
      {/* Displays the latest standard sales invoices */}
      <div className="section-header">
        <h3 className="section-title">Recent Bills</h3>
        {/* Navigates to history page with the 'Generated Bills' tab active */}
        <button className="view-all-link" onClick={() => onNavigate('history', { state: { tab: 'new' } })}>View All</button>
      </div>
      <div className="bills-grid">
        {/* Map through recent bills or show a placeholder message if empty */}
        {recentBills.length > 0 ? recentBills.map((bill) => (
            <div key={bill._id} className="bill-card" onClick={() => onViewBill(bill)}>
              {/* Mini preview of the bill for visual reference */}
              <div className="card-preview"><div className="mini-bill-wrapper"><BillPreview data={{...bill, billDate: bill.date, clientName: bill.client.name, paymentMode: "Credit", shopMobile: "6385278892"}} items={bill.items} totals={bill.totals} /></div></div>
              {/* Card Footer: Client Name, Amount, Bill ID, and Date */}
              <div className="card-footer">
                <div className="card-row-1"><span className="card-client">{bill.client.name}</span><span className="card-amount">₹{bill.totals?.netAmount}</span></div>
                <div className="card-row-2"><span className="card-id">#{bill.billNo}</span><span>{bill.date}</span></div>
              </div>
            </div>
        )) : <div style={{color:'#94a3b8'}}>No bills yet.</div>}
      </div>

      {/* 2. RECENT RETURNS SECTION */}
      {/* Displays the latest return transactions */}
      <div className="section-header" style={{marginTop:'40px'}}>
        <h3 className="section-title">Recent Returns</h3>
        {/* Navigates to history page with the 'Return Generated Bills' tab active */}
        <button className="view-all-link" onClick={() => onNavigate('history', { state: { tab: 'return' } })}>View All</button>
      </div>
      <div className="bills-grid">
        {recentReturns.length > 0 ? recentReturns.map((ret) => (
            <div key={ret._id} className="bill-card" onClick={() => onViewBill(ret)}>
              <div className="card-preview"><div className="mini-bill-wrapper"><BillPreview data={{billNo: ret.returnId, billDate: ret.returnDate, clientName: ret.client.name, paymentMode: "Return Note", shopMobile: "6385278892"}} items={ret.items} totals={ret.totals} /></div></div>
              {/* Distinct styling (Red border/text) to indicate a negative/return transaction */}
              <div className="card-footer" style={{borderTop:'2px solid #f87171'}}>
                <div className="card-row-1"><span className="card-client">{ret.client.name}</span><span style={{color:'#dc2626'}}>- ₹{ret.totals?.netAmount}</span></div>
                <div className="card-row-2"><span className="card-id" style={{background:'#fef2f2', color:'#991b1b'}}>Ret #{ret.returnId}</span><span>{ret.returnDate}</span></div>
              </div>
            </div>
        )) : <div style={{color:'#94a3b8'}}>No returns yet.</div>}
      </div>

      {/* 3. RECENT UPDATED BILLS (NEW) */}
      {/* Displays bills that were recalculated after a return */}
      <div className="section-header" style={{marginTop:'40px'}}>
        <h3 className="section-title">Updated Final Bills</h3>
        {/* Navigates to history page with the 'Updated Final Bills' tab active */}
        <button className="view-all-link" onClick={() => onNavigate('history', { state: { tab: 'updated' } })}>View All</button>
      </div>
      <div className="bills-grid">
        {recentUpdated && recentUpdated.length > 0 ? recentUpdated.map((upd) => (
            <div key={upd._id} className="bill-card" onClick={() => onViewBill(upd)}>
              <div className="card-preview"><div className="mini-bill-wrapper"><BillPreview data={{billNo: upd.updatedBillId, billDate: upd.date, clientName: upd.client.name, paymentMode: "Final Bill", shopMobile: "6385278892"}} items={upd.items} totals={upd.totals} /></div></div>
              {/* Distinct styling (Blue border/text) to indicate an updated/finalized bill */}
              <div className="card-footer" style={{borderTop:'2px solid #3b82f6'}}>
                <div className="card-row-1"><span className="card-client">{upd.client.name}</span><span style={{color:'#2563eb'}}>₹{upd.totals?.netAmount}</span></div>
                <div className="card-row-2"><span className="card-id" style={{background:'#eff6ff', color:'#1d4ed8'}}>{upd.updatedBillId}</span><span>{upd.date}</span></div>
              </div>
            </div>
        )) : <div style={{color:'#94a3b8'}}>No updated bills yet.</div>}
      </div>
      
    </div>
  );
}