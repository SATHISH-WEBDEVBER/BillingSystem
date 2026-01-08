import React from 'react';
import SearchableSelect from './SearchableSelect';
import { Icons } from './Icons';

export default function EditorProductRow({ item, index, updateItem, removeItem, productCatalog }) {
  const selectedCategory = productCatalog.find(c => c.category === item.category);
  const subItems = selectedCategory ? selectedCategory.items : [];

  return (
    <div className="product-row-db">
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
        <input 
            type="number" 
            placeholder="Qty" 
            value={item.qty} 
            onChange={(e) => updateItem(index, "qty", e.target.value)} 
            style={{ flex: 1 }} 
        />
        <input 
            placeholder="Unit" 
            value={item.unit} 
            onChange={(e) => updateItem(index, "unit", e.target.value)} 
            style={{ flex: 1 }} 
        />
        {/* CHANGED: Removed readOnly and className="input-readonly" */}
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