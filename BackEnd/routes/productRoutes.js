// Import the Express framework and create a router instance
const express = require('express');
const router = express.Router();
// Import the Product model to interact with the database
const Product = require('../models/Product');

// GET all products
// Route to fetch every product category and its items from the database
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST (Add new Category/Products)
// Route to create a new product category containing a list of items
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
// Route to update the base price of items in the database based on a bill transaction
router.put('/bulk-update', async (req, res) => {
  const itemsToUpdate = req.body; // Array of items from the bill

  try {
    // Loop through each item in the bill
    for (const item of itemsToUpdate) {
      if (item.category && item.desc && item.rate) {
        // Find the product category and update the specific item's price
        // Uses the positional operator ($) to match the correct item within the 'items' array
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

// Export the router to be used in the main application file
module.exports = router;