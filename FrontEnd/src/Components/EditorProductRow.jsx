import React from 'react';
import SearchableSelect from './SearchableSelect';
import { Icons } from './Icons';

export default function EditorProductRow({ item, index, updateItem, removeItem, productCatalog }) {
  const selectedCategory = productCatalog.find(c => c.category === item.category);
  const subItems = selectedCategory ? selectedCategory.items : [];
  
  // Find the specific item object to check stock
  const selectedProductItem = selectedCategory?.items.find(i => i.name === item.desc);
  
  // CHANGED: Use 'qty' instead of 'quantity'
  const maxStock = selectedProductItem ? selectedProductItem.qty : 0;
  
  // Check if current input exceeds stock
  const isOverselling = selectedProductItem && Number(item.qty) > maxStock;

  const handleQtyChange = (val) => {
    updateItem(index, "qty", val); 
  };

  return (
    <div className="product-row-db" style={{border: isOverselling ? '1px solid #dc2626' : '1px solid #e2e8f0'}}>
      {/* Row 1: Searchable Dropdowns */}
      <div style={{ display: "flex", gap: "5px", marginBottom: "8px" }}>
        <div style={{ flex: 1 }}>
          <SearchableSelect
            placeholder="Category"
            options={productCatalog.map(c => c.category)}
            value={item.category}
            onChange={(val) => updateItem(index, "category", val)}
          />
        </div>

        <div style={{ flex: 1.5 }}>
          <SearchableSelect
            placeholder={item.category ? "Search Item" : "Select Category"}
            options={subItems.map(s => s.name)}
            value={item.desc}
            onChange={(val) => updateItem(index, "desc", val)}
            disabled={!item.category}
          />
        </div>

        <button onClick={() => removeItem(index)} className="btn-icon-del">
          <Icons.Trash />
        </button>
      </div>

      {/* Row 2: Numbers */}
      <div style={{ display: "flex", gap: "5px" }}>
        <div style={{flex:1}}>
            <input 
                type="number" 
                placeholder="Qty" 
                value={item.qty} 
                onChange={(e) => handleQtyChange(e.target.value)} 
                style={{ width: '100%', borderColor: isOverselling ? '#dc2626' : '#e2e8f0' }}
            />
            {/* Stock Warning / Error Message */}
            {selectedProductItem && (
                <div style={{fontSize:'10px', marginTop:'2px'}}>
                    {isOverselling ? (
                        <span style={{color:'#dc2626', fontWeight:'bold'}}>Max available: {maxStock}</span>
                    ) : (
                        <span style={{color: maxStock < 10 ? '#ea580c' : '#64748b'}}>
                           {maxStock < 10 ? `Low Stock: ${maxStock} left` : `Stock: ${maxStock}`}
                        </span>
                    )}
                </div>
            )}
        </div>

        <input 
            placeholder="Unit" 
            value={item.unit} 
            onChange={(e) => updateItem(index, "unit", e.target.value)} 
            style={{ flex: 1 }} 
        />
        <input 
            type="number" 
            placeholder="Rate" 
            value={item.rate} 
            onChange={(e) => updateItem(index, "rate", e.target.value)} 
            style={{ flex: 1, fontWeight: "bold" }} 
        />
      </div>
    </div>
  );
}