import React from 'react';
import SearchableSelect from './SearchableSelect';
import { Icons } from './Icons';

// Component representing a single row in the product list editor
// Allows selecting a category, a specific product, and entering quantity/rate
export default function EditorProductRow({ item, index, updateItem, removeItem, productCatalog }) {
  // Logic: Find the full category object from the catalog based on the selected category name
  const selectedCategory = productCatalog.find(c => c.category === item.category);
  // Logic: If a category is selected, get its list of items; otherwise, the list is empty
  const subItems = selectedCategory ? selectedCategory.items : [];

  return (
    <div className="product-row-db">
      {/* Row 1: Searchable Dropdowns for Category and Product Description */}
      <div style={{ display: "flex", gap: "5px", marginBottom: "8px" }}>
        {/* Category Selection Dropdown */}
        <div style={{ flex: 1 }}>
          <SearchableSelect
            placeholder="Category"
            options={productCatalog.map(c => c.category)}
            value={item.category}
            onChange={(val) => updateItem(index, "category", val)}
          />
        </div>

        {/* Item Selection Dropdown (Dependent on Category) */}
        <div style={{ flex: 1.5 }}>
          <SearchableSelect
            placeholder={item.category ? "Search Item" : "Select Category"}
            // Filters options to only show items belonging to the selected category
            options={subItems.map(s => s.name)}
            value={item.desc}
            onChange={(val) => updateItem(index, "desc", val)}
            // Disable this field until a category is chosen
            disabled={!item.category}
          />
        </div>

        {/* Delete Button to remove this specific row */}
        <button onClick={() => removeItem(index)} className="btn-icon-del">
          <Icons.Trash />
        </button>
      </div>

      {/* Row 2: Numeric Inputs for Quantity, Unit, and Price */}
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
        {/* This input is now editable, allowing the user to manually override the price */}
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