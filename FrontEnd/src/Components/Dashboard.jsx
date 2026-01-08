import React from 'react';
import { Icons } from './Icons';
import EditorProductRow from './EditorProductRow';
import '../styles/dashboard.css'; 

export default function Dashboard({ billData, handleDataChange, items, updateItem, removeItem, addItem, productCatalog, onGenerate }) {
  return (
    <>
      <div className="editor-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Icons.Dashboard />
          <h2>Billing Dashboard</h2>
        </div>
      </div>

      <div className="editor-content">
        {/* Client Section */}
        <div className="form-group">
          <div className="form-section-title">Client Details</div>
          <div className="input-grid">
            <input name="clientName" placeholder="Name" value={billData.clientName} onChange={handleDataChange} />
            <input name="clientMobile" placeholder="Mobile" value={billData.clientMobile} onChange={handleDataChange} />
          </div>
          <input name="clientAddress" placeholder="Address" value={billData.clientAddress} onChange={handleDataChange} style={{ marginTop: "12px" }} />
        </div>

        {/* Invoice Section */}
        <div className="form-group">
          <div className="form-section-title">Invoice Details</div>
          <div className="input-grid">
            <div>
              <label style={{fontSize:"12px", marginBottom:"4px", display:"block", color:"#64748b"}}>Date</label>
              <input type="date" name="billDate" value={billData.billDate} onChange={handleDataChange} />
            </div>
            <div>
              <label style={{fontSize:"12px", marginBottom:"4px", display:"block", color:"#64748b"}}>Bill No</label>
              <input name="billNo" value={billData.billNo} readOnly style={{backgroundColor:"#f1f5f9", cursor:"not-allowed"}} />
            </div>
          </div>
        </div>

        {/* Product Section */}
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
          <button onClick={addItem} className="btn-add">
            <Icons.Plus /> Add New Item
          </button>
        </div>
      </div>

      <div className="editor-footer">
        <button onClick={onGenerate} className="btn-primary">
          <Icons.Check /> Generate Bill
        </button>
      </div>
    </>
  );
}