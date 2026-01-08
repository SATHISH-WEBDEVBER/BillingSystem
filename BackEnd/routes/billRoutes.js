const express = require('express');
const router = express.Router();
// NOTE: Ensure the folder name 'Models' matches your actual folder name (Capital M based on your error log)
const Counter = require('../models/Counter'); 
const Bill = require('../models/Bill'); 

// 1. Get Next Bill Number
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

// 2. SAVE BILL
router.post('/save', async (req, res) => {
  const { billNo, date, client, items, totals } = req.body;

  try {
    // A. Save the Bill
    const newBill = new Bill({
      billNo,
      date,
      client,
      items,
      totals
    });
    await newBill.save();

    // B. Update the Counter
    await Counter.findOneAndUpdate(
      { id: 'billNo' },
      { $inc: { seq: 1 } }
    );

    res.status(201).json({ message: "Bill Saved Successfully", id: newBill._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save bill" });
  }
});

module.exports = router;