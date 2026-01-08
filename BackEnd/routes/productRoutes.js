const express = require('express');
const router = express.Router();
const Product = require('../Models/Product');

// GET all products (Categories + Items)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST (To add data easily via Postman or Script)
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

module.exports = router;