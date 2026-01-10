const express = require('express');
const router = express.Router();
const UpdatedBill = require('../models/UpdatedBill');

// 1. GET RECENT (Limit 6)
router.get('/', async (req, res) => {
  try {
    const bills = await UpdatedBill.find().sort({ createdAt: -1 }).limit(6);
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET ALL
router.get('/all', async (req, res) => {
  try {
    const bills = await UpdatedBill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;