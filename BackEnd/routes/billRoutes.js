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

// --- FIXED: FIND BILL BY NUMBER ---
router.get('/find/:billNo', async (req, res) => {
  try {
    // Get the text "7" from the URL
    const searchInput = req.params.billNo.trim();
    
    // Convert it to a real Number: 7
    const billNoNum = parseInt(searchInput);

    // Safety check: make sure it's a valid number
    if (isNaN(billNoNum)) {
        return res.status(400).json({ message: "Invalid Bill Number provided" });
    }

    // Search for the Number 7 in the DB.
    // Since the model is now 'Number', this will match correctly.
    const bill = await Bill.findOne({ billNo: billNoNum });
    
    if (!bill) {
        // If this still happens, it means the number truly isn't in the DB.
        return res.status(404).json({ message: "Bill not found in database" });
    }
    
    res.json(bill);
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ message: "Server error searching for bill" });
  }
});

// 3. GET SALES STATS
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

// 4. NEXT BILL NO
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

// 5. SAVE
router.post('/save', async (req, res) => {
  const { billNo, date, client, items, totals } = req.body;
  try {
    // Ensure billNo is saved as a number
    const newBill = new Bill({ ...req.body, billNo: Number(billNo) });
    await newBill.save();
    await Counter.findOneAndUpdate({ id: 'billNo' }, { $inc: { seq: 1 } });
    res.status(201).json({ message: "Saved", id: newBill._id });
  } catch (err) {
    res.status(500).json({ message: "Error saving" });
  }
});

// 6. UPDATE
router.put('/update/:id', async (req, res) => {
  try {
    await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Updated" });
  } catch (err) {
    res.status(500).json({ message: "Error updating" });
  }
});

// 7. DELETE
router.delete('/delete/:id', async (req, res) => {
  try {
    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting" });
  }
});

module.exports = router;