import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/report.css';

// The main ReportPage component handling Business Analytics views
export default function ReportPage() {
  // State to toggle between different report views ('menu', 'bill', 'product')
  const [view, setView] = useState('menu'); // 'menu', 'bill', 'product'
  // State to store sales statistics fetched from the backend
  const [stats, setStats] = useState({ daily: 0, weekly: 0, monthly: 0 });
  // State to handle loading status during API calls
  const [loading, setLoading] = useState(false);

  // Fetch Stats Only when entering Bill View
  // Optimization: Data is only requested when the user actually opens the "Sales Reports" section
  useEffect(() => {
    if (view === 'bill') {
      fetchStats();
    }
  }, [view]);

  // Async function to call the backend API and get sales totals
  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/bills/stats');
      setStats(res.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
    setLoading(false);
  };

  // Helper for "Smart Money" Format (No decimals, Indian Format)
  // Formats numbers like 12000 to "₹12,000" without decimal points for cleaner UI
  const formatMoney = (amount) => {
    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0, // No decimal places (remove digits)
      minimumFractionDigits: 0
    });
  };

  // --- 1. MAIN MENU VIEW ---
  // The initial landing screen of the Reports page showing navigation options
  if (view === 'menu') {
    return (
      <div className="report-container">
        <div className="report-header-text">
          <h2>Business Analytics</h2>
          <p>Track your sales performance and inventory</p>
        </div>

        <div className="report-menu">
          
          {/* Card to navigate to Sales Reports */}
          <div className="report-card-btn" onClick={() => setView('bill')}>
            <div className="report-icon">📊</div>
            <div>
              <h3>Sales Reports</h3>
              <p>Daily, Weekly & Monthly sales analysis</p>
            </div>
          </div>

          {/* Card to navigate to Inventory Reports */}
          <div className="report-card-btn" onClick={() => setView('product')}>
            <div className="report-icon">📦</div>
            <div>
              <h3>Inventory Reports</h3>
              <p>Stock levels and product performance</p>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // --- 2. BILL STATS VIEW (Smart Dashboard) ---
  // The detailed view displaying financial statistics (Daily, Weekly, Monthly)
  if (view === 'bill') {
    return (
      <div className="report-container">
        {/* Navigation header to go back to the menu */}
        <div className="stats-header">
          <button className="back-link" onClick={() => setView('menu')}>
            ← Dashboard
          </button>
          <h2 style={{margin:0, fontSize:"20px"}}>Sales Overview</h2>
        </div>

        {/* Conditional rendering: Show loading text while fetching data */}
        {loading ? (
          <div style={{textAlign:'center', padding:40, color:'#64748b'}}>Calculating sales data...</div>
        ) : (
          <div className="stats-grid">
            
            {/* Today's Sales Card */}
            <div className="stat-card daily">
              <div className="stat-header">
                <span className="stat-label">Today's Sales</span>
                <div className="stat-icon-bg">📅</div>
              </div>
              <div className="stat-value">{formatMoney(stats.daily)}</div>
              <div className="stat-footer">Updated just now</div>
            </div>

            {/* Weekly Sales Card */}
            <div className="stat-card weekly">
              <div className="stat-header">
                <span className="stat-label">This Week</span>
                <div className="stat-icon-bg">📈</div>
              </div>
              <div className="stat-value">{formatMoney(stats.weekly)}</div>
              <div className="stat-footer">Current week performance</div>
            </div>

            {/* Monthly Sales Card */}
            <div className="stat-card monthly">
              <div className="stat-header">
                <span className="stat-label">This Month</span>
                <div className="stat-icon-bg">🏆</div>
              </div>
              <div className="stat-value">{formatMoney(stats.monthly)}</div>
              <div className="stat-footer">Total for current month</div>
            </div>

          </div>
        )}
      </div>
    );
  }

  // --- 3. PRODUCT VIEW (Placeholder) ---
  // Currently a "Coming Soon" screen for future inventory features
  if (view === 'product') {
    return (
      <div className="report-container">
        <div className="stats-header">
          <button className="back-link" onClick={() => setView('menu')}>
            ← Dashboard
          </button>
          <h2 style={{margin:0, fontSize:"20px"}}>Inventory Stats</h2>
        </div>
        
        <div className="empty-state-product">
          <div style={{fontSize:"40px", marginBottom:"10px"}}>🚧</div>
          <h3 style={{margin:"0 0 10px 0", color:"#1e293b"}}>Product Analytics Coming Soon</h3>
          <p style={{margin:0, color:"#64748b"}}>We are building advanced inventory tracking features.</p>
        </div>
      </div>
    );
  }

  // Fallback return (should technically not be reached given logic above)
  return null;
}