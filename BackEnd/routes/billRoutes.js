const express = require('express');
const router = express.Router();
const Counter = require('../models/Counter');
const Bill = require('../models/Bill'); 

// 1. GET RECENT BILLS
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 }).limit(6);
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET ALL BILLS
router.get('/all', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. GET NEXT BILL NUMBER
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

// 4. SAVE NEW BILL (POST)
router.post('/save', async (req, res) => {
  const { billNo, date, client, items, totals } = req.body;
  try {
    const newBill = new Bill({ billNo, date, client, items, totals });
    await newBill.save();
    // Only increment counter for NEW bills
    await Counter.findOneAndUpdate({ id: 'billNo' }, { $inc: { seq: 1 } });
    res.status(201).json({ message: "Bill Saved Successfully", id: newBill._id });
  } catch (err) {
    res.status(500).json({ message: "Failed to save bill" });
  }
});

// 5. UPDATE EXISTING BILL (PUT) - NEW
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;
    
    // Update the bill by ID, do NOT increment counter
    await Bill.findByIdAndUpdate(id, updatedData, { new: true });
    
    res.json({ message: "Bill Updated Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update bill" });
  }
});

// 6. DELETE BILL (DELETE) - NEW
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Bill.findByIdAndDelete(id);
    res.json({ message: "Bill Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete bill" });
  }
});

module.exports = router;