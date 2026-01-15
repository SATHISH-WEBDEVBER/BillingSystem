import React from 'react';
import EditorProductRow from './EditorProductRow';
import { Icons } from './Icons';
import '../styles/dashboard.css';

export default function Dashboard({ 
  billData, 
  handleDataChange, 
  items, 
  updateItem, 
  removeItem, 
  addItem, 
  productCatalog, 
  onGenerate 
}) {
  return (
    <>
      <div className="editor-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{fontSize:'24px'}}><Icons.Dashboard /></div>
          <h2>Billing Dashboard</h2>
        </div>
      </div>

      <div className="editor-content">
        {/* Client Details Section */}
        <div className="form-group">
          <div className="form-section-title">Client Details</div>
          <div className="input-grid">
            <input 
              name="clientName" 
              placeholder="Enter Client Name" 
              value={billData.clientName} 
              onChange={handleDataChange} 
            />
            <input 
              name="clientMobile" 
              placeholder="Enter Mobile Number" 
              value={billData.clientMobile} 
              onChange={handleDataChange} 
            />
          </div>
          <div style={{marginTop: '12px'}}>
            <input 
              name="clientAddress" 
              placeholder="Enter Client Address / Place" 
              value={billData.clientAddress} 
              onChange={handleDataChange} 
            />
          </div>
        </div>

        {/* Invoice Details Section */}
        <div className="form-group">
          <div className="form-section-title">Invoice Details</div>
          <div className="input-grid">
            <div>
              <label style={{fontSize:'12px', color:'#64748b', display:'block', marginBottom:'5px'}}>Date</label>
              <input type="date" name="billDate" value={billData.billDate} onChange={handleDataChange} />
            </div>
            <div>
              <label style={{fontSize:'12px', color:'#64748b', display:'block', marginBottom:'5px'}}>Bill No</label>
              <input name="billNo" value={billData.billNo} readOnly style={{background:'#f1f5f9', color:'#64748b'}} />
            </div>
            {/* NEW PAYMENT MODE SELECTOR */}
            <div>
              <label style={{fontSize:'12px', color:'#64748b', display:'block', marginBottom:'5px'}}>Payment Mode</label>
              <select name="paymentMode" value={billData.paymentMode} onChange={handleDataChange}>
                <option value="Credit">Credit</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products List Section */}
        <div className="form-group">
          <div className="form-section-title">Products List</div>
          {items.map((item, index) => (
            <EditorProductRow 
              key={index}
              index={index}
              item={item}
              updateItem={updateItem}
              removeItem={removeItem}
              productCatalog={productCatalog}
            />
          ))}
          
          <button className="btn-add" onClick={addItem}>
            <Icons.Plus /> Add New Item
          </button>
        </div>
      </div>

      <div className="editor-footer">
        <button className="btn-primary" onClick={onGenerate}>
          <Icons.Check /> Generate Bill
        </button>
      </div>
    </>
  );
}