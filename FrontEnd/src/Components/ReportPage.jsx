import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Icons } from './Icons'; // Imported Icons
import '../styles/report.css';

export default function ReportPage() {
  const [view, setView] = useState('menu'); 
  const [stats, setStats] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [loading, setLoading] = useState(false);

  // SALES ANALYSIS STATE
  const [analysisType, setAnalysisType] = useState('day');
  const [analysisValue, setAnalysisValue] = useState('');
  const [customTotal, setCustomTotal] = useState(null);
  const [loadingCustom, setLoadingCustom] = useState(false);

  // INVENTORY STATE
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // EDIT ITEM STATE
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [editItemData, setEditItemData] = useState({ name: "", price: "", qty: "", unit: "" });

  // ADD ITEM STATE
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemData, setNewItemData] = useState({ name: "", price: "", qty: "", unit: "" });

  // PROD STATS STATE
  const [prodAnalysisType, setProdAnalysisType] = useState('day');
  const [prodAnalysisValue, setProdAnalysisValue] = useState('');
  const [soldProducts, setSoldProducts] = useState([]);
  const [loadingProdStats, setLoadingProdStats] = useState(false);

  useEffect(() => {
    if (view === 'bill') {
      fetchStats();
      const today = new Date().toISOString().split('T')[0];
      setAnalysisValue(today);
      fetchCustomStats('day', today);
    }
    if (view === 'product') {
      fetchInventory();
      const today = new Date().toISOString().split('T')[0];
      setProdAnalysisValue(today);
      fetchProductStats('day', today);
    }
  }, [view]);

  // --- API CALLS ---
  const fetchStats = async () => {
    setLoading(true);
    try { const res = await axios.get('http://localhost:5000/api/bills/stats'); setStats(res.data); } catch (e) {}
    setLoading(false);
  };

  const fetchInventory = async () => {
    setLoading(true);
    try { const res = await axios.get('http://localhost:5000/api/products'); setProducts(res.data); } catch (e) {}
    setLoading(false);
  };

  const fetchCustomStats = async (type, value) => {
    if (!value) return;
    setLoadingCustom(true);
    try { const res = await axios.post('http://localhost:5000/api/bills/custom-stats', { type, value }); setCustomTotal(res.data.total); } catch (e) {}
    setLoadingCustom(false);
  };

  const fetchProductStats = async (type, value) => {
    if (!value) return;
    setLoadingProdStats(true);
    try { const res = await axios.post('http://localhost:5000/api/bills/product-stats', { type, value }); setSoldProducts(res.data); } catch (e) {}
    setLoadingProdStats(false);
  };

  // --- EDIT HANDLERS ---
  const handleEditClick = (item, index) => {
    setEditingItemIndex(index);
    setEditItemData({ ...item }); 
  };

  const handleCancelEdit = () => {
    setEditingItemIndex(null);
    setEditItemData({ name: "", price: "", qty: "", unit: "" });
  };

  const handleSaveEdit = async (oldName) => {
    if(!editItemData.name || editItemData.price < 0 || editItemData.qty < 0 || !editItemData.unit) {
      alert("Please fill all fields correctly.");
      return;
    }

    try {
      await axios.put('http://localhost:5000/api/products/item/update', {
        category: selectedCategory.category,
        oldName: oldName,
        newItemData: editItemData
      });
      
      const updatedItems = [...selectedCategory.items];
      updatedItems[editingItemIndex] = { ...editItemData, price: Number(editItemData.price), qty: Number(editItemData.qty) };
      setSelectedCategory({ ...selectedCategory, items: updatedItems });
      
      handleCancelEdit(); 
    } catch (err) {
      alert("Failed to update item.");
    }
  };

  // --- ADD ITEM HANDLERS ---
  const handleAddNewClick = () => {
    setIsAddingItem(true);
    setNewItemData({ name: "", price: "", qty: "", unit: "" });
  };

  const handleCancelNew = () => {
    setIsAddingItem(false);
    setNewItemData({ name: "", price: "", qty: "", unit: "" });
  };

  const handleSaveNew = async () => {
    if (!newItemData.name.trim() || !newItemData.unit.trim()) {
      alert("Name and Unit are required.");
      return;
    }
    if (newItemData.price === "" || newItemData.qty === "" || isNaN(newItemData.price) || isNaN(newItemData.qty)) {
      alert("Price and Quantity must be valid numbers.");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/products/item/add', {
        category: selectedCategory.category,
        newItem: newItemData
      });

      const updatedItems = [...selectedCategory.items, { 
        name: newItemData.name, 
        price: Number(newItemData.price), 
        qty: Number(newItemData.qty), 
        unit: newItemData.unit 
      }];
      setSelectedCategory({ ...selectedCategory, items: updatedItems });

      handleCancelNew(); 
    } catch (err) {
      alert("Failed to add new item.");
    }
  };

  // --- OTHER HANDLERS ---
  const handleAnalysisChange = (e) => { const val = e.target.value; setAnalysisValue(val); fetchCustomStats(analysisType, val); };
  const handleTabChange = (type) => { setAnalysisType(type); setAnalysisValue(''); setCustomTotal(null); };
  const handleProdAnalysisChange = (e) => { const val = e.target.value; setProdAnalysisValue(val); fetchProductStats(prodAnalysisType, val); };
  const handleProdTabChange = (type) => { setProdAnalysisType(type); setProdAnalysisValue(''); setSoldProducts([]); };
  const formatMoney = (amount) => amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  // --- 1. MENU VIEW ---
  if (view === 'menu') {
    return (
      <div className="report-container">
        <div className="report-header-text"><h2>Business Analytics</h2><p>Track your sales performance and inventory</p></div>
        <div className="report-menu">
          <div className="report-card-btn" onClick={() => setView('bill')}><div className="report-icon">📊</div><div><h3>Sales Reports</h3><p>Daily, Weekly & Monthly sales analysis</p></div></div>
          <div className="report-card-btn" onClick={() => setView('product')}><div className="report-icon">📦</div><div><h3>Inventory Reports</h3><p>Stock levels and product performance</p></div></div>
        </div>
      </div>
    );
  }

  // --- 2. SALES REPORT VIEW ---
  if (view === 'bill') {
    return (
      <div className="report-container">
        <div className="stats-header">
          <button className="back-link" onClick={() => setView('menu')}>← Dashboard</button>
          <h2 style={{margin:0, fontSize:"18px", color:"#1e293b"}}>Sales Overview</h2>
        </div>
        {loading ? <div style={{textAlign:'center', padding:40, color:'#64748b'}}>Loading data...</div> : (
          <>
            <div className="stats-grid">
              <div className="stat-card daily"><div className="stat-header"><span className="stat-label">Today</span><div className="stat-icon-bg">📅</div></div><div className="stat-value">{formatMoney(stats.daily)}</div><div className="stat-footer">Updated just now</div></div>
              <div className="stat-card weekly"><div className="stat-header"><span className="stat-label">This Week</span><div className="stat-icon-bg">📈</div></div><div className="stat-value">{formatMoney(stats.weekly)}</div><div className="stat-footer">Current week</div></div>
              <div className="stat-card monthly"><div className="stat-header"><span className="stat-label">This Month</span><div className="stat-icon-bg">🏆</div></div><div className="stat-value">{formatMoney(stats.monthly)}</div><div className="stat-footer">Current month</div></div>
            </div>
            <div className="analysis-section">
              <div className="analysis-header">
                <div><h3>Custom Analysis</h3><p>Check sales for any date range</p></div>
                <div className="analysis-tabs">
                  <button className={`analysis-tab ${analysisType === 'day' ? 'active' : ''}`} onClick={() => handleTabChange('day')}>Daily</button>
                  <button className={`analysis-tab ${analysisType === 'week' ? 'active' : ''}`} onClick={() => handleTabChange('week')}>Weekly</button>
                  <button className={`analysis-tab ${analysisType === 'month' ? 'active' : ''}`} onClick={() => handleTabChange('month')}>Monthly</button>
                </div>
              </div>
              <div className="analysis-controls">
                {analysisType === 'day' && <input type="date" className="analysis-input" value={analysisValue} onChange={handleAnalysisChange} />}
                {analysisType === 'week' && <input type="week" className="analysis-input" value={analysisValue} onChange={handleAnalysisChange} />}
                {analysisType === 'month' && <input type="month" className="analysis-input" value={analysisValue} onChange={handleAnalysisChange} />}
                <div className="analysis-result-card">
                  <div style={{fontSize:'12px', color:'#94a3b8', textTransform:'uppercase', fontWeight:'bold'}}>Total Sales</div>
                  <div style={{fontSize:'24px', fontWeight:'700'}}>{loadingCustom ? "..." : (customTotal !== null ? formatMoney(customTotal) : "—")}</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // --- 3. INVENTORY REPORT VIEW ---
  if (view === 'product') {
    return (
      <div className="report-container">
        <div className="stats-header">
          <button className="back-link" onClick={() => setView('menu')}>← Dashboard</button>
          <h2 style={{margin:0, fontSize:"18px", color:"#1e293b"}}>Inventory Management</h2>
        </div>
        
        {!selectedCategory ? (
          <>
            <h3 style={{margin:'0 0 20px 0', color:'#334155'}}>Product Categories</h3>
            <div className="inventory-grid">
              {products.map((cat, idx) => (
                <div key={idx} className="category-card" onClick={() => setSelectedCategory(cat)}>
                  <h3>{cat.category}</h3>
                  <p>{cat.items.length} Items</p>
                </div>
              ))}
            </div>

            <div className="analysis-section" style={{marginTop:'50px', borderTop:'4px solid #f59e0b'}}>
              <div className="analysis-header">
                <div><h3>Product Sales Analysis</h3><p>See exactly what products sold</p></div>
                <div className="analysis-tabs">
                  <button className={`analysis-tab ${prodAnalysisType === 'day' ? 'active' : ''}`} onClick={() => handleProdTabChange('day')}>Daily</button>
                  <button className={`analysis-tab ${prodAnalysisType === 'week' ? 'active' : ''}`} onClick={() => handleProdTabChange('week')}>Weekly</button>
                  <button className={`analysis-tab ${prodAnalysisType === 'month' ? 'active' : ''}`} onClick={() => handleProdTabChange('month')}>Monthly</button>
                </div>
              </div>
              <div className="analysis-controls">
                {prodAnalysisType === 'day' && <input type="date" className="analysis-input" value={prodAnalysisValue} onChange={handleProdAnalysisChange} />}
                {prodAnalysisType === 'week' && <input type="week" className="analysis-input" value={prodAnalysisValue} onChange={handleProdAnalysisChange} />}
                {prodAnalysisType === 'month' && <input type="month" className="analysis-input" value={prodAnalysisValue} onChange={handleProdAnalysisChange} />}
              </div>
              <div className="sold-products-list">
                {loadingProdStats && <div style={{padding:'20px', color:'#64748b'}}>Loading...</div>}
                {!loadingProdStats && soldProducts.length === 0 && <div style={{padding:'30px', color:'#94a3b8', textAlign:'center'}}>No sales found for this period.</div>}
                {soldProducts.length > 0 && (
                  <table className="report-table">
                    <thead><tr><th>Product Name</th><th>Category</th><th>Quantity Sold</th></tr></thead>
                    <tbody>
                      {soldProducts.map((p, idx) => (
                        <tr key={idx}>
                          <td>{p.name}</td>
                          <td><span style={{background:'#f1f5f9', padding:'2px 8px', borderRadius:'4px', fontSize:'12px'}}>{p.category}</span></td>
                          <td style={{fontWeight:'700', color:'#2563eb'}}>{p.qty} {p.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="items-view">
            <button className="back-btn-small" onClick={() => setSelectedCategory(null)}>← Back to Categories</button>
            <div className="analysis-section" style={{marginTop:'10px', borderTop:'none'}}>
                <div style={{marginBottom:'20px'}}>
                    <h3 style={{margin:0, color:'#1e293b'}}>{selectedCategory.category} - Current Stock</h3>
                    <p style={{margin:'5px 0 0 0', fontSize:'13px', color:'#64748b'}}>Manage products and stock levels</p>
                </div>
                
                <div className="items-table-container">
                  <table className="report-table">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th style={{width:'100px'}}>Price</th>
                        <th style={{width:'120px'}}>Stock</th>
                        <th style={{width:'100px'}}>Unit</th>
                        <th style={{width:'120px'}}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCategory.items.map((item, i) => (
                        <tr key={i}>
                          {editingItemIndex === i ? (
                            // --- EDIT MODE ---
                            <>
                              <td><input className="edit-input" value={editItemData.name} onChange={(e) => setEditItemData({...editItemData, name: e.target.value})} placeholder="Name" /></td>
                              <td><input className="edit-input" type="number" value={editItemData.price} onChange={(e) => setEditItemData({...editItemData, price: e.target.value})} placeholder="Price" /></td>
                              <td><input className="edit-input" type="number" value={editItemData.qty} onChange={(e) => setEditItemData({...editItemData, qty: e.target.value})} placeholder="Qty" /></td>
                              <td><input className="edit-input" value={editItemData.unit} onChange={(e) => setEditItemData({...editItemData, unit: e.target.value})} placeholder="Unit" /></td>
                              <td>
                                <div className="action-buttons-wrapper">
                                  <button className="btn-icon-action btn-icon-save" onClick={() => handleSaveEdit(item.name)} title="Save"><Icons.CheckSmall /></button>
                                  <button className="btn-icon-action btn-icon-cancel" onClick={handleCancelEdit} title="Cancel"><Icons.Close /></button>
                                </div>
                              </td>
                            </>
                          ) : (
                            // --- VIEW MODE ---
                            <>
                              <td style={{fontWeight:'500'}}>{item.name}</td>
                              <td>₹{item.price}</td>
                              <td style={{fontWeight:'bold', color: item.qty < 10 ? '#dc2626' : '#16a34a'}}>
                                {item.qty} 
                                {item.qty < 10 && <div className="low-stock-badge">⚠️ Low</div>}
                              </td>
                              <td>{item.unit}</td>
                              <td>
                                <button className="btn-icon-action btn-icon-edit" onClick={() => handleEditClick(item, i)} title="Edit Item"><span style={{fontSize:'16px'}}>✎</span></button>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}

                      {/* --- ADD NEW ITEM ROW --- */}
                      {isAddingItem && (
                        <tr style={{background:'#f0f9ff'}}>
                          <td><input className="edit-input" value={newItemData.name} onChange={(e) => setNewItemData({...newItemData, name: e.target.value})} placeholder="New Item Name" autoFocus /></td>
                          <td><input className="edit-input" type="number" value={newItemData.price} onChange={(e) => setNewItemData({...newItemData, price: e.target.value})} placeholder="Price" /></td>
                          <td><input className="edit-input" type="number" value={newItemData.qty} onChange={(e) => setNewItemData({...newItemData, qty: e.target.value})} placeholder="Qty" /></td>
                          <td><input className="edit-input" value={newItemData.unit} onChange={(e) => setNewItemData({...newItemData, unit: e.target.value})} placeholder="Unit" /></td>
                          <td>
                            <div className="action-buttons-wrapper">
                              <button className="btn-icon-action btn-icon-save" onClick={handleSaveNew} title="Add Item"><Icons.CheckSmall /></button>
                              <button className="btn-icon-action btn-icon-cancel" onClick={handleCancelNew} title="Cancel"><Icons.Close /></button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  
                  {/* ADD BUTTON */}
                  {!isAddingItem && (
                    <button className="btn-add-item-row" onClick={handleAddNewClick}>
                      <span style={{fontSize:'18px'}}>+</span> Add New Item
                    </button>
                  )}
                </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}