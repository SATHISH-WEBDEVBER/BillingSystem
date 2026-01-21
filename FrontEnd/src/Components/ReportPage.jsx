import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/report.css';

export default function ReportPage() {
  const [view, setView] = useState('menu'); // 'menu', 'bill', 'product'
  const [stats, setStats] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [loading, setLoading] = useState(false);

  // --- NEW STATE FOR CUSTOM ANALYSIS ---
  const [analysisType, setAnalysisType] = useState('day'); // 'day', 'week', 'month'
  const [analysisValue, setAnalysisValue] = useState('');
  const [customTotal, setCustomTotal] = useState(null);
  const [loadingCustom, setLoadingCustom] = useState(false);

  // Fetch Stats Only when entering Bill View
  useEffect(() => {
    if (view === 'bill') {
      fetchStats();
      // Set default analysis value to today
      const today = new Date().toISOString().split('T')[0];
      setAnalysisValue(today);
      fetchCustomStats('day', today);
    }
  }, [view]);

  // Fetch Overview Stats
  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/bills/stats');
      setStats(res.data);
    } catch (error) { console.error("Error fetching stats:", error); }
    setLoading(false);
  };

  // --- NEW: Fetch Custom Stats ---
  const fetchCustomStats = async (type, value) => {
    if (!value) return;
    setLoadingCustom(true);
    try {
      const res = await axios.post('http://localhost:5000/api/bills/custom-stats', { type, value });
      setCustomTotal(res.data.total);
    } catch (error) { console.error("Error fetching custom stats:", error); }
    setLoadingCustom(false);
  };

  // Handle Input Change for Custom Stats
  const handleAnalysisChange = (e) => {
    const val = e.target.value;
    setAnalysisValue(val);
    fetchCustomStats(analysisType, val);
  };

  // Handle Tab Switch
  const handleTabChange = (type) => {
    setAnalysisType(type);
    setAnalysisValue(''); // Reset value to force user to pick
    setCustomTotal(null); // Reset result
  };

  // Helper for "Smart Money" Format (No decimals, Indian Format)
  const formatMoney = (amount) => {
    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0, 
      minimumFractionDigits: 0
    });
  };

  // --- 1. MAIN MENU VIEW ---
  if (view === 'menu') {
    return (
      <div className="report-container">
        <div className="report-header-text">
          <h2>Business Analytics</h2>
          <p>Track your sales performance and inventory</p>
        </div>

        <div className="report-menu">
          
          <div className="report-card-btn" onClick={() => setView('bill')}>
            <div className="report-icon">📊</div>
            <div>
              <h3>Sales Reports</h3>
              <p>Daily, Weekly & Monthly sales analysis</p>
            </div>
          </div>

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
  if (view === 'bill') {
    return (
      <div className="report-container">
        <div className="stats-header">
          <button className="back-link" onClick={() => setView('menu')}>
            ← Dashboard
          </button>
          <h2 style={{margin:0, fontSize:"20px"}}>Sales Overview</h2>
        </div>

        {loading ? (
          <div style={{textAlign:'center', padding:40, color:'#64748b'}}>Calculating sales data...</div>
        ) : (
          <>
            {/* EXISTING OVERVIEW GRID */}
            <div className="stats-grid">
              
              <div className="stat-card daily">
                <div className="stat-header">
                  <span className="stat-label">Today's Sales</span>
                  <div className="stat-icon-bg">📅</div>
                </div>
                <div className="stat-value">{formatMoney(stats.daily)}</div>
                <div className="stat-footer">Updated just now</div>
              </div>

              <div className="stat-card weekly">
                <div className="stat-header">
                  <span className="stat-label">This Week</span>
                  <div className="stat-icon-bg">📈</div>
                </div>
                <div className="stat-value">{formatMoney(stats.weekly)}</div>
                <div className="stat-footer">Current week performance</div>
              </div>

              <div className="stat-card monthly">
                <div className="stat-header">
                  <span className="stat-label">This Month</span>
                  <div className="stat-icon-bg">🏆</div>
                </div>
                <div className="stat-value">{formatMoney(stats.monthly)}</div>
                <div className="stat-footer">Total for current month</div>
              </div>

            </div>

            {/* --- NEW: DETAILED ANALYSIS SECTION --- */}
            <div className="analysis-section">
              <div className="analysis-header">
                <h3>Detailed Sales Analysis</h3>
                <p>Select a specific period to check past performance</p>
              </div>

              <div className="analysis-tabs">
                <button className={`analysis-tab ${analysisType === 'day' ? 'active' : ''}`} onClick={() => handleTabChange('day')}>Daily</button>
                <button className={`analysis-tab ${analysisType === 'week' ? 'active' : ''}`} onClick={() => handleTabChange('week')}>Weekly</button>
                <button className={`analysis-tab ${analysisType === 'month' ? 'active' : ''}`} onClick={() => handleTabChange('month')}>Monthly</button>
              </div>

              <div className="analysis-controls">
                {analysisType === 'day' && (
                  <input type="date" className="analysis-input" value={analysisValue} onChange={handleAnalysisChange} />
                )}
                {analysisType === 'week' && (
                  <input type="week" className="analysis-input" value={analysisValue} onChange={handleAnalysisChange} />
                )}
                {analysisType === 'month' && (
                  <input type="month" className="analysis-input" value={analysisValue} onChange={handleAnalysisChange} />
                )}

                <div className="analysis-result-card">
                  <div style={{fontSize:'13px', color:'#94a3b8', textTransform:'uppercase', fontWeight:'bold', letterSpacing:'0.5px'}}>
                    {analysisType === 'day' ? "Day's Total" : (analysisType === 'week' ? "Week's Total" : "Month's Total")}
                  </div>
                  <div style={{fontSize:'28px', fontWeight:'700', color:'#fff'}}>
                    {loadingCustom ? "..." : (customTotal !== null ? formatMoney(customTotal) : "—")}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // --- 3. PRODUCT VIEW (Placeholder) ---
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

  return null;
}