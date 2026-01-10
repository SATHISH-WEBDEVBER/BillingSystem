const express = require('express');
const router = express.Router();
const ReturnBill = require('../models/ReturnBill');
// const Counter = require('../models/Counter'); // No longer needed
const { recalculateUpdatedBill } = require('../utils/billLogic');

// 1. GET RECENT RETURNS
router.get('/', async (req, res) => {
  try {
    const returns = await ReturnBill.find().sort({ createdAt: -1 }).limit(6);
    res.json(returns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET ALL RETURNS
router.get('/all', async (req, res) => {
  try {
    const returns = await ReturnBill.find().sort({ createdAt: -1 });
    res.json(returns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. CHECK RETURN EXISTS
router.get('/check/:billNo', async (req, res) => {
  try {
    const searchInput = req.params.billNo.trim();
    const query = {
      $or: [
        { originalBillNo: searchInput }, 
        { originalBillNo: parseInt(searchInput) || -1 } 
      ]
    };
    const existingReturn = await ReturnBill.findOne(query);
    if (existingReturn) {
      return res.json({ exists: true, returnBill: existingReturn });
    }
    res.json({ exists: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 4. NEXT RETURN ID (NEW LOGIC: PREVIOUS + 1) ---
router.get('/next-number', async (req, res) => {
  try {
    // Find return with highest returnId
    const lastReturn = await ReturnBill.findOne().sort({ returnId: -1 });
    
    // If found, add 1. If not, start at 101.
    const nextReturnId = lastReturn && lastReturn.returnId ? lastReturn.returnId + 1 : 101;
    
    res.json({ nextReturnId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- 5. SAVE RETURN (NEW LOGIC: PREVIOUS + 1) ---
router.post('/save', async (req, res) => {
  const { originalBillNo, returnDate, client, items, totals } = req.body;
  try {
    // Recalculate ID server-side to ensure it is "Last + 1"
    const lastReturn = await ReturnBill.findOne().sort({ returnId: -1 });
    const returnId = lastReturn && lastReturn.returnId ? lastReturn.returnId + 1 : 101;

    const newReturn = new ReturnBill({ returnId, originalBillNo, returnDate, client, items, totals });
    await newReturn.save();
    
    // Removed Counter logic

    // TRIGGER UPDATE LOGIC
    await recalculateUpdatedBill(originalBillNo);

    res.status(201).json({ message: "Return Bill Saved", id: newReturn._id });
  } catch (err) {
    res.status(500).json({ message: "Failed to save return" });
  }
});

// 6. UPDATE RETURN
router.put('/update/:id', async (req, res) => {
  try {
    const updatedReturn = await ReturnBill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    if (updatedReturn) await recalculateUpdatedBill(updatedReturn.originalBillNo);

    res.json({ message: "Return Bill Updated Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update return bill" });
  }
});

// 7. DELETE RETURN
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedReturn = await ReturnBill.findByIdAndDelete(req.params.id);
    
    if (deletedReturn) await recalculateUpdatedBill(deletedReturn.originalBillNo);

    res.json({ message: "Return Bill Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete return bill" });
  }
});

module.exports = router;