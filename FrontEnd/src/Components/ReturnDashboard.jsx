import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { calculateTotals } from '../utils/calculations';
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
  onReturnExists // New Prop from App.jsx
}) {
  const [searchBillNo, setSearchBillNo] = useState("");
  const [loading, setLoading] = useState(false);

  // --- 1. SEARCH LOGIC (Updated) ---
  const handleSearch = async () => {
    if (!searchBillNo) return onError("Please enter a Bill Number.");
    
    setLoading(true);
    try {
      // Step A: Check if Return Already Exists
      const checkRes = await axios.get(`http://localhost:5000/api/returns/check/${searchBillNo}`);
      
      if (checkRes.data.exists) {
        setLoading(false);
        // Trigger the parent modal logic
        onReturnExists(checkRes.data.returnBill);
        return; 
      }

      // Step B: If NOT exists, find the original bill
      const res = await axios.get(`http://localhost:5000/api/bills/find/${searchBillNo}`);
      const bill = res.data;
      
      setReturnData(prev => ({
        ...prev,
        originalBillNo: bill.billNo,
        clientName: bill.client.name,
        clientMobile: bill.client.mobile,
        clientAddress: bill.client.address
      }));
      setReturnItems(bill.items);
      
    } catch (error) {
      console.error("Search failed:", error);
      onError("Bill not found! Please check the number and try again.");
      setReturnItems([]);
      setReturnData(prev => ({...prev, originalBillNo: ""}));
    }
    setLoading(false);
  };

  // --- 2. ITEM HELPERS ---
  const updateItem = (index, field, value) => {
    const updated = [...returnItems];
    updated[index][field] = value;
    setReturnItems(updated);
  };

  const removeItem = (index) => {
    const updated = returnItems.filter((_, i) => i !== index);
    setReturnItems(updated);
  };

  const handleGenerate = () => {
    if (returnItems.length === 0) return onError("No items selected for return.");
    onGenerateReturn(); 
  };

  return (
    <>
      <div className="editor-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{color: '#dc2626'}}><Icons.Return /></div>
          <h2>Return Dashboard</h2>
        </div>
      </div>

      <div className="editor-content">
        
        {/* STEP 1: SEARCH */}
        {!returnData.originalBillNo && (
            <div className="form-group" style={{textAlign:'center', padding:'40px 20px'}}>
                <div style={{marginBottom:'20px'}}>
                    <div style={{background:'#eff6ff', width:'60px', height:'60px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 15px', color:'#2563eb'}}>
                        <Icons.Refresh /> 
                    </div>
                    <h3 style={{margin:0, color:'#1e293b'}}>Find Original Bill</h3>
                    <p style={{color:'#64748b', fontSize:'14px'}}>Enter the bill number to load items</p>
                </div>

                <div style={{display:'flex', gap:'10px', maxWidth:'400px', margin:'0 auto'}}>
                    <input 
                        type="number"
                        placeholder="Ex: 12" 
                        value={searchBillNo}
                        onChange={(e) => setSearchBillNo(e.target.value)}
                        style={{flex:1}}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button onClick={handleSearch} className="btn-primary" style={{width:'auto', padding:'0 25px'}}>
                        {loading ? "..." : "Find"}
                    </button>
                </div>
            </div>
        )}

        {/* STEP 2: DETAILS */}
        {returnData.originalBillNo && (
            <>
                <div className="form-group" style={{borderLeft:'4px solid #2563eb'}}>
                    <div className="form-section-title">Original Bill Info</div>
                    <div className="input-grid">
                        <div>
                            <label className="input-label">Client Name</label>
                            <input value={returnData.clientName} readOnly className="input-readonly" />
                        </div>
                        <div>
                            <label className="input-label">Orig. Bill No</label>
                            <input value={returnData.originalBillNo} readOnly className="input-readonly" />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <div className="form-section-title" style={{display:'flex', justifyContent:'space-between'}}>
                        <span>Return Items</span>
                        <span style={{color:'#dc2626', fontSize:'11px'}}>* Remove items NOT being returned</span>
                    </div>
                    
                    {returnItems.map((item, index) => (
                        <EditorProductRow 
                            key={index}
                            index={index}
                            item={item}
                            updateItem={updateItem}
                            removeItem={removeItem}
                            productCatalog={productCatalog}
                        />
                    ))}
                    
                    {returnItems.length === 0 && (
                        <div style={{padding:'20px', textAlign:'center', color:'#dc2626', background:'#fef2f2', borderRadius:'8px'}}>
                            No items left. Please reload bill if needed.
                        </div>
                    )}
                </div>
            </>
        )}
      </div>

      <div className="editor-footer">
        {returnData.originalBillNo ? (
            <div style={{display:'flex', gap:'10px', width:'100%'}}>
                <button onClick={() => setReturnData(prev => ({...prev, originalBillNo: ""}))} className="btn" style={{background:'#f1f5f9', color:'#64748b'}}>
                    Cancel
                </button>
                <button onClick={handleGenerate} className="btn-primary" style={{background:'#dc2626'}}>
                    Process Return
                </button>
            </div>
        ) : (
            <div style={{fontSize:'12px', color:'#94a3b8', textAlign:'center', width:'100%'}}>
                Search a bill to begin return process
            </div>
        )}
      </div>
    </>
  );
}