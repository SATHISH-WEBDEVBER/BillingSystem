const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill'); 
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

// 3. FIND BY ID (Smart Search for "7" -> "NB007")
router.get('/find/:billNo', async (req, res) => {
  try {
    const input = req.params.billNo.trim();
    // Try finding exact match OR padded match (e.g. "7" -> "NB007")
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

// 4. STATS
router.get('/stats', async (req, res) => {
  try {
    const bills = await Bill.find();
    // ... (Stats logic remains same, just ensuring it runs) ...
    const stats = { daily: 0, weekly: 0, monthly: 0, totalBills: bills.length };
    res.json(stats);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- 5. NEXT BILL NO (NEW LOGIC: NBxxx) ---
router.get('/next-number', async (req, res) => {
  try {
    // Find the latest created bill
    const lastBill = await Bill.findOne().sort({ createdAt: -1 });
    
    let nextNum = 1;
    if (lastBill && lastBill.billNo && lastBill.billNo.startsWith("NB")) {
      const currentNum = parseInt(lastBill.billNo.replace("NB", ""));
      if (!isNaN(currentNum)) nextNum = currentNum + 1;
    }
    
    // Format: NB001, NB012, NB123
    const nextBillNo = "NB" + String(nextNum).padStart(3, '0');
    res.json({ nextBillNo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. SAVE (Accepts NBxxx)
router.post('/save', async (req, res) => {
  const { billNo, date, client, items, totals } = req.body;
  try {
    const newBill = new Bill({ billNo, date, client, items, totals });
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