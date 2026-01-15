import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Icons } from './Icons';
import EditorProductRow from './EditorProductRow';
import '../styles/dashboard.css'; 

export default function ReturnDashboard({ 
  productCatalog, 
  onGenerateReturn, 
  onError, 
  returnData, 
  setReturnData, 
  returnItems, 
  setReturnItems,
  onReturnExists 
}) {
  const [searchBillNo, setSearchBillNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [originalBillItems, setOriginalBillItems] = useState([]);
  const [selectedRestoreItem, setSelectedRestoreItem] = useState("");

  // Auto-load items for Edit Mode
  useEffect(() => {
    const fetchOriginalItems = async () => {
      if (returnData.originalBillNo && originalBillItems.length === 0) {
        try {
          const res = await axios.get(`http://localhost:5000/api/bills/find/${returnData.originalBillNo}`);
          if (res.data && res.data.items) setOriginalBillItems(res.data.items);
        } catch (error) { console.error("Failed to load original items:", error); }
      }
    };
    fetchOriginalItems();
  }, [returnData.originalBillNo, originalBillItems.length]);

  // --- SEARCH LOGIC (Updated ID Logic) ---
  const handleSearch = async () => {
    if (!searchBillNo) return onError("Please enter a Bill Number.");
    setLoading(true);
    try {
      // Check Exists
      const checkRes = await axios.get(`http://localhost:5000/api/returns/check/${searchBillNo}`);
      if (checkRes.data.exists) {
        setLoading(false);
        onReturnExists(checkRes.data.returnBill);
        return; 
      }

      // Find Bill
      const res = await axios.get(`http://localhost:5000/api/bills/find/${searchBillNo}`);
      const bill = res.data;
      
      // LOGIC: Generate Return ID (NB007 -> RB007)
      const newReturnId = bill.billNo.replace("NB", "RB");

      setReturnData(prev => ({
        ...prev,
        returnId: newReturnId, 
        originalBillNo: bill.billNo,
        clientName: bill.client.name,
        clientMobile: bill.client.mobile,
        clientAddress: bill.client.address,
        // NEW: Auto-populate Payment Mode from Original Bill
        paymentMode: bill.paymentMode || "Credit" 
      }));
      
      setReturnItems(bill.items);
      setOriginalBillItems(bill.items);
      
    } catch (error) {
      console.error("Search failed:", error);
      onError("Bill not found! Ensure it follows 'NBxxx' format.");
      setReturnItems([]);
      setReturnData(prev => ({...prev, originalBillNo: ""}));
      setOriginalBillItems([]);
    }
    setLoading(false);
  };

  const updateItem = (index, field, value) => { const updated = [...returnItems]; updated[index][field] = value; setReturnItems(updated); };
  const removeItem = (index) => { const updated = returnItems.filter((_, i) => i !== index); setReturnItems(updated); };
  const handleRestoreItem = () => { if (!selectedRestoreItem) return; const itemToAdd = originalBillItems.find(item => item._id === selectedRestoreItem); if (itemToAdd) { setReturnItems([...returnItems, { ...itemToAdd }]); setSelectedRestoreItem(""); } };
  const handleGenerate = () => { if (returnItems.length === 0) return onError("No items selected for return."); onGenerateReturn(); };
  const availableToRestore = originalBillItems.filter(ogItem => !returnItems.some(rItem => rItem.desc === ogItem.desc));

  return (
    <>
      <div className="editor-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{color: '#dc2626'}}><Icons.Return /></div>
          <h2>Return Dashboard</h2>
        </div>
      </div>

      <div className="editor-content">
        {!returnData.originalBillNo && (
            <div className="form-group" style={{textAlign:'center', padding:'40px 20px'}}>
                <div style={{marginBottom:'20px'}}>
                    <div style={{background:'#eff6ff', width:'60px', height:'60px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 15px', color:'#2563eb'}}>
                        <Icons.Refresh /> 
                    </div>
                    <h3 style={{margin:0, color:'#1e293b'}}>Find Original Bill</h3>
                    <p style={{color:'#64748b', fontSize:'14px'}}>Enter Bill No (e.g. 7 or NB007)</p>
                </div>
                <div style={{display:'flex', gap:'10px', maxWidth:'400px', margin:'0 auto'}}>
                    <input type="text" placeholder="Ex: NB007" value={searchBillNo} onChange={(e) => setSearchBillNo(e.target.value)} style={{flex:1}} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                    <button onClick={handleSearch} className="btn-primary" style={{width:'auto', padding:'0 25px'}}>{loading ? "..." : "Find"}</button>
                </div>
            </div>
        )}

        {returnData.originalBillNo && (
            <>
                <div className="form-group" style={{borderLeft:'4px solid #2563eb'}}>
                    <div className="form-section-title">Original Bill Info</div>
                    <div className="input-grid">
                        <div><label className="input-label">Client Name</label><input value={returnData.clientName} readOnly className="input-readonly" /></div>
                        <div><label className="input-label">Return ID</label><input value={returnData.returnId} readOnly className="input-readonly" style={{fontWeight:'bold', color:'#dc2626'}} /></div>
                    </div>
                    {/* NEW: Payment Mode Dropdown for Return */}
                    <div style={{marginTop:'12px'}}>
                        <label style={{fontSize:'12px', color:'#64748b', display:'block', marginBottom:'5px'}}>Return Payment Mode</label>
                        <select 
                            value={returnData.paymentMode} 
                            onChange={(e) => setReturnData({...returnData, paymentMode: e.target.value})}
                            style={{width:'100%', padding:'10px', border:'1px solid #e2e8f0', borderRadius:'6px'}}
                        >
                            <option value="Credit">Credit</option>
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI</option>
                        </select>
                    </div>
                </div>

                <div className="form-group" style={{background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px dashed #cbd5e1'}}>
                    <div className="form-section-title" style={{marginBottom: '10px', color: '#475569'}}>Add Product from Invoice</div>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <select value={selectedRestoreItem} onChange={(e) => setSelectedRestoreItem(e.target.value)} style={{flex: 1}}>
                            <option value="">Select product to restore...</option>
                            {availableToRestore.map(item => (<option key={item._id} value={item._id}>{item.desc}</option>))}
                        </select>
                        <button onClick={handleRestoreItem} className="btn-primary" style={{width: 'auto', padding: '0 20px', background: '#3b82f6'}} disabled={!selectedRestoreItem}>Add</button>
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-section-title" style={{display:'flex', justifyContent:'space-between'}}><span>Return Items</span><span style={{color:'#dc2626', fontSize:'11px'}}>* Remove items NOT being returned</span></div>
                    {returnItems.map((item, index) => (<EditorProductRow key={index} index={index} item={item} updateItem={updateItem} removeItem={removeItem} productCatalog={productCatalog} />))}
                    {returnItems.length === 0 && <div style={{padding:'20px', textAlign:'center', color:'#dc2626', background:'#fef2f2', borderRadius:'8px'}}>No items left. Use the box above to add products back.</div>}
                </div>
            </>
        )}
      </div>

      <div className="editor-footer">
        {returnData.originalBillNo ? (
            <div style={{display:'flex', gap:'10px', width:'100%'}}>
                <button onClick={() => setReturnData(prev => ({...prev, originalBillNo: ""}))} className="btn" style={{background:'#f1f5f9', color:'#64748b'}}>Cancel</button>
                <button onClick={handleGenerate} className="btn-primary" style={{background:'#dc2626'}}>Process Return</button>
            </div>
        ) : (<div style={{fontSize:'12px', color:'#94a3b8', textAlign:'center', width:'100%'}}>Search a bill to begin return process</div>)}
      </div>
    </>
  );
}