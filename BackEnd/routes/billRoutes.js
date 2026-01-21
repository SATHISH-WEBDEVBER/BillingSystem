const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill'); 
const ReturnBill = require('../models/ReturnBill'); 
const { recalculateUpdatedBill } = require('../utils/billLogic');

// 1. GET RECENT
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 }).limit(6);
    res.json(bills);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. GET ALL
router.get('/all', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 3. FIND BY ID
router.get('/find/:billNo', async (req, res) => {
  try {
    const input = req.params.billNo.trim();
    const formatted = "NB" + input.padStart(3, '0');
    
    const query = {
      $or: [
        { billNo: input },
        { billNo: formatted }
      ]
    };

    const bill = await Bill.findOne(query);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 4. STATS (Overview)
router.get('/stats', async (req, res) => {
  try {
    const bills = await Bill.find();
    const returns = await ReturnBill.find(); 

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

    // 1. ADD Original Bill Amounts
    bills.forEach(bill => {
      const billDate = bill.date;
      const amount = Number(bill.totals.netAmount) || 0;
      
      if (billDate === todayStr) stats.daily += amount;
      if (billDate >= startOfWeekStr && billDate <= todayStr) stats.weekly += amount;
      if (billDate >= startOfMonthStr && billDate <= todayStr) stats.monthly += amount;
    });

    // 2. SUBTRACT Return Bill Amounts
    returns.forEach(ret => {
      const returnDate = ret.returnDate;
      const amount = Number(ret.totals.netAmount) || 0;

      if (returnDate === todayStr) stats.daily -= amount;
      if (returnDate >= startOfWeekStr && returnDate <= todayStr) stats.weekly -= amount;
      if (returnDate >= startOfMonthStr && returnDate <= todayStr) stats.monthly -= amount;
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- NEW: CUSTOM ANALYTICS ROUTE ---
router.post('/custom-stats', async (req, res) => {
  try {
    const { type, value } = req.body; // value examples: '2023-10-25' (day), '2023-W43' (week), '2023-10' (month)
    const bills = await Bill.find();
    const returns = await ReturnBill.find();

    let totalSales = 0;

    // Helper to check if a date string falls in the selected ISO week
    const isDateInWeek = (dateStr, weekStr) => {
        if (!dateStr || !weekStr) return false;
        const d = new Date(dateStr);
        const dateYear = d.getFullYear();
        // Calculate ISO week number manually
        const tdt = new Date(d.valueOf());
        const dayn = (d.getDay() + 6) % 7;
        tdt.setDate(tdt.getDate() - dayn + 3);
        const firstThursday = tdt.valueOf();
        tdt.setMonth(0, 1);
        if (tdt.getDay() !== 4) {
            tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
        }
        const weekNum = 1 + Math.ceil((firstThursday - tdt) / 604800000);
        
        // Format constructed week string: "2023-W43"
        const constructedWeek = `${dateYear}-W${String(weekNum).padStart(2, '0')}`;
        return constructedWeek === weekStr;
    };

    // 1. Sum Bills
    bills.forEach(bill => {
      const d = bill.date;
      const amt = Number(bill.totals.netAmount) || 0;
      let match = false;

      if (type === 'day' && d === value) match = true;
      if (type === 'month' && d.startsWith(value)) match = true;
      if (type === 'week' && isDateInWeek(d, value)) match = true;

      if (match) totalSales += amt;
    });

    // 2. Subtract Returns
    returns.forEach(ret => {
      const d = ret.returnDate;
      const amt = Number(ret.totals.netAmount) || 0;
      let match = false;

      if (type === 'day' && d === value) match = true;
      if (type === 'month' && d.startsWith(value)) match = true;
      if (type === 'week' && isDateInWeek(d, value)) match = true;

      if (match) totalSales -= amt;
    });

    res.json({ total: totalSales });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 5. NEXT BILL NO ---
router.get('/next-number', async (req, res) => {
  try {
    const lastBill = await Bill.findOne().sort({ createdAt: -1 });
    let nextNum = 1;
    if (lastBill && lastBill.billNo && lastBill.billNo.startsWith("NB")) {
      const currentNum = parseInt(lastBill.billNo.replace("NB", ""));
      if (!isNaN(currentNum)) nextNum = currentNum + 1;
    }
    const nextBillNo = "NB" + String(nextNum).padStart(3, '0');
    res.json({ nextBillNo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. SAVE
router.post('/save', async (req, res) => {
  const { billNo, date, client, items, totals, paymentMode } = req.body;
  try {
    const newBill = new Bill({ billNo, date, client, items, totals, paymentMode });
    await newBill.save();
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
  } catch (err) { res.status(500).json({ message: "Error updating" }); }
});

// 8. DELETE
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedBill = await Bill.findByIdAndDelete(req.params.id);
    if (deletedBill) await recalculateUpdatedBill(deletedBill.billNo);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: "Error deleting" }); }
});

module.exports = router;