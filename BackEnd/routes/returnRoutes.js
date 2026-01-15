const express = require('express');
const router = express.Router();
const ReturnBill = require('../models/ReturnBill');
const { recalculateUpdatedBill } = require('../utils/billLogic');

// 1. GET RECENT
router.get('/', async (req, res) => {
  try {
    const returns = await ReturnBill.find().sort({ createdAt: -1 }).limit(6);
    res.json(returns);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. GET ALL
router.get('/all', async (req, res) => {
  try {
    const returns = await ReturnBill.find().sort({ createdAt: -1 });
    res.json(returns);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 3. CHECK EXISTS (Smart Check)
router.get('/check/:billNo', async (req, res) => {
  try {
    const input = req.params.billNo.trim();
    const formatted = "NB" + input.padStart(3, '0');
    
    // Check if return exists for "NB007" or input "NB007"
    const query = {
      $or: [
        { originalBillNo: input },
        { originalBillNo: formatted }
      ]
    };
    const existingReturn = await ReturnBill.findOne(query);
    if (existingReturn) {
      return res.json({ exists: true, returnBill: existingReturn });
    }
    res.json({ exists: false });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 4. NEXT NUMBER (REMOVED/DUMMY)
router.get('/next-number', async (req, res) => {
  res.json({ nextReturnId: "" }); 
});

// 5. SAVE (Forces RB ID)
router.post('/save', async (req, res) => {
  // ADDED paymentMode to destructuring
  const { originalBillNo, returnDate, client, items, totals, paymentMode } = req.body;
  try {
    // LOGIC: NB007 -> RB007
    const returnId = originalBillNo.replace("NB", "RB");

    // ADDED paymentMode to new document
    const newReturn = new ReturnBill({ returnId, originalBillNo, returnDate, client, items, totals, paymentMode });
    await newReturn.save();

    await recalculateUpdatedBill(originalBillNo);

    res.status(201).json({ message: "Return Bill Saved", id: newReturn._id });
  } catch (err) {
    res.status(500).json({ message: "Failed to save return" });
  }
});

// 6. UPDATE
router.put('/update/:id', async (req, res) => {
  try {
    const updatedReturn = await ReturnBill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedReturn) await recalculateUpdatedBill(updatedReturn.originalBillNo);
    res.json({ message: "Updated" });
  } catch (err) { res.status(500).json({ message: "Error updating" }); }
});

// 7. DELETE
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedReturn = await ReturnBill.findByIdAndDelete(req.params.id);
    if (deletedReturn) await recalculateUpdatedBill(deletedReturn.originalBillNo);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: "Error deleting" }); }
});

module.exports = router;