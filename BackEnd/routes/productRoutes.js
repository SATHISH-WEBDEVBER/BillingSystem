const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST (Create Category)
router.post('/', async (req, res) => {
  const product = new Product({
    category: req.body.category,
    items: req.body.items
  });
  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- BULK UPDATE (For Billing) ---
router.put('/bulk-update', async (req, res) => {
  const itemsToUpdate = req.body; 
  try {
    for (const item of itemsToUpdate) {
      if (item.category && item.desc && item.rate) {
        await Product.updateOne(
          { category: item.category, "items.name": item.desc },
          { $set: { "items.$.price": item.rate } }
        );
      }
    }
    res.json({ message: "Prices updated successfully" });
  } catch (err) {
    console.error("Price Update Error:", err);
    res.status(500).json({ message: "Failed to update prices" });
  }
});

// --- NEW: EDIT SINGLE ITEM ---
router.put('/item/update', async (req, res) => {
  const { category, oldName, newItemData } = req.body;
  try {
    await Product.updateOne(
      { category: category, "items.name": oldName },
      { 
        $set: { 
          "items.$.name": newItemData.name,
          "items.$.price": Number(newItemData.price),
          "items.$.qty": Number(newItemData.qty),
          "items.$.unit": newItemData.unit
        } 
      }
    );
    res.json({ message: "Item updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- NEW: ADD NEW ITEM TO CATEGORY ---
router.post('/item/add', async (req, res) => {
  const { category, newItem } = req.body;
  try {
    await Product.updateOne(
      { category: category },
      { 
        $push: { 
          items: {
            name: newItem.name,
            price: Number(newItem.price),
            qty: Number(newItem.qty),
            unit: newItem.unit
          } 
        } 
      }
    );
    res.json({ message: "Item added" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;