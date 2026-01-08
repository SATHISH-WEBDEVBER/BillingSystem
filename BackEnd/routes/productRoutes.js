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

// POST (Add new Category/Products)
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

// --- NEW ROUTE: Bulk Update Prices ---
router.put('/bulk-update', async (req, res) => {
  const itemsToUpdate = req.body; // Array of items from the bill

  try {
    // Loop through each item in the bill
    for (const item of itemsToUpdate) {
      if (item.category && item.desc && item.rate) {
        // Find the product category and update the specific item's price
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

module.exports = router;