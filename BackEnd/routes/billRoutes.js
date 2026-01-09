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

// 3. GET SALES STATS (FIXED DATE LOGIC)
router.get('/stats', async (req, res) => {
  try {
    const bills = await Bill.find(); 
    
    const now = new Date();

    // Helper: Format Date as YYYY-MM-DD (Local Time, No UTC Shift)
    const toDateString = (dateObj) => {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const todayStr = toDateString(now);

    // Calculate Start of Week (Sunday)
    const startOfWeekDate = new Date(now);
    startOfWeekDate.setDate(now.getDate() - now.getDay());
    const startOfWeekStr = toDateString(startOfWeekDate);

    // Calculate Start of Month (1st)
    const startOfMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthStr = toDateString(startOfMonthDate);

    let stats = {
      daily: 0,
      weekly: 0,
      monthly: 0,
      totalBills: bills.length
    };

    bills.forEach(bill => {
      const billDate = bill.date; // Stored as "YYYY-MM-DD"
      // Ensure amount is a number
      const amount = Number(bill.totals.netAmount) || 0;

      // 1. Daily: Exact Match
      if (billDate === todayStr) {
        stats.daily += amount;
      }

      // 2. Weekly: Range Check
      if (billDate >= startOfWeekStr && billDate <= todayStr) {
        stats.weekly += amount;
      }

      // 3. Monthly: Range Check
      if (billDate >= startOfMonthStr && billDate <= todayStr) {
        stats.monthly += amount;
      }
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
    const newBill = new Bill({ billNo, date, client, items, totals });
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