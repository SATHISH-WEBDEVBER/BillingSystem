const express = require('express');
const router = express.Router();
// const Counter = require('../models/Counter'); // No longer needed
const Bill = require('../models/Bill'); 
const { recalculateUpdatedBill } = require('../utils/billLogic');

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

// 3. FIND BY ID
router.get('/find/:billNo', async (req, res) => {
  try {
    const searchInput = req.params.billNo.trim();
    const searchNumber = parseInt(searchInput);
    const query = {
      $or: [ { billNo: searchInput }, { billNo: searchNumber } ]
    };
    if (isNaN(searchNumber)) query.$or.pop();

    const bill = await Bill.findOne(query);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 4. STATS
router.get('/stats', async (req, res) => {
  try {
    const bills = await Bill.find(); 
    const now = new Date();
    const toDateString = (dateObj) => {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };
    const todayStr = toDateString(now);
    const startOfWeekDate = new Date(now);
    startOfWeekDate.setDate(now.getDate() - now.getDay());
    const startOfWeekStr = toDateString(startOfWeekDate);
    const startOfMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthStr = toDateString(startOfMonthDate);

    let stats = { daily: 0, weekly: 0, monthly: 0, totalBills: bills.length };

    bills.forEach(bill => {
      const billDate = bill.date;
      const amount = Number(bill.totals.netAmount) || 0;
      if (billDate === todayStr) stats.daily += amount;
      if (billDate >= startOfWeekStr && billDate <= todayStr) stats.weekly += amount;
      if (billDate >= startOfMonthStr && billDate <= todayStr) stats.monthly += amount;
    });
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 5. NEXT BILL NO (NEW LOGIC: PREVIOUS + 1) ---
router.get('/next-number', async (req, res) => {
  try {
    // Find the bill with the highest billNo
    const lastBill = await Bill.findOne().sort({ billNo: -1 });
    
    // If found, add 1. If no bills exist, start at 1.
    const nextBillNo = lastBill && lastBill.billNo ? lastBill.billNo + 1 : 1;
    
    res.json({ nextBillNo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 6. SAVE (UPDATED: NO COUNTER) ---
router.post('/save', async (req, res) => {
  const { billNo, date, client, items, totals } = req.body;
  try {
    // We trust the billNo sent from frontend (which fetched it from next-number)
    // OR we could recalculate it here to be safe, but sticking to logic:
    const newBill = new Bill({ ...req.body, billNo: Number(billNo) });
    
    await newBill.save();
    // Removed Counter.findOneAndUpdate logic
    
    res.status(201).json({ message: "Saved", id: newBill._id });
  } catch (err) {
    res.status(500).json({ message: "Error saving" });
  }
});

// 7. UPDATE
router.put('/update/:id', async (req, res) => {
  try {
    const updatedBill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedBill) await recalculateUpdatedBill(updatedBill.billNo);
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ message: "Error updating" });
  }
});

// 8. DELETE
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedBill = await Bill.findByIdAndDelete(req.params.id);
    if (deletedBill) await recalculateUpdatedBill(deletedBill.billNo);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting" });
  }
});

module.exports = router;