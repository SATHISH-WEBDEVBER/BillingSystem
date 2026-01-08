const express = require('express');
const router = express.Router();
const Counter = require('../models/Counter');
const Bill = require('../models/Bill'); 

// 1. GET RECENT BILLS (Limit 6) - For Home Page
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 }).limit(6);
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET ALL BILLS - For History Page (NEW ROUTE)
router.get('/all', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 }); // No limit
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Get Next Bill Number
router.get('/next-number', async (req, res) => {
  try {
    let counter = await Counter.findOne({ id: 'billNo' });
    if (!counter) {
      counter = new Counter({ id: 'billNo', seq: 20740 });
      await counter.save();
    }
    res.json({ nextBillNo: counter.seq + 1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. SAVE BILL
router.post('/save', async (req, res) => {
  const { billNo, date, client, items, totals } = req.body;

  try {
    const newBill = new Bill({ billNo, date, client, items, totals });
    await newBill.save();
    await Counter.findOneAndUpdate({ id: 'billNo' }, { $inc: { seq: 1 } });
    res.status(201).json({ message: "Bill Saved Successfully", id: newBill._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save bill" });
  }
});

module.exports = router;