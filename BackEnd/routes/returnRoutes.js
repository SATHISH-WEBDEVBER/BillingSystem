// Import Express and create the router
const express = require('express');
const router = express.Router();
// Import the ReturnBill model
const ReturnBill = require('../models/ReturnBill');
// Import utility to recalculate bill totals/inventory when returns change
const { recalculateUpdatedBill } = require('../utils/billLogic');

// 1. GET RECENT
// Route to fetch the 6 most recent return transactions for the dashboard
router.get('/', async (req, res) => {
  try {
    const returns = await ReturnBill.find().sort({ createdAt: -1 }).limit(6);
    res.json(returns);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. GET ALL
// Route to fetch the complete history of all return transactions
router.get('/all', async (req, res) => {
  try {
    const returns = await ReturnBill.find().sort({ createdAt: -1 });
    res.json(returns);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 3. CHECK EXISTS (Smart Check)
// Route to check if a return has already been processed for a specific bill
router.get('/check/:billNo', async (req, res) => {
  try {
    const input = req.params.billNo.trim();
    // Format input to standard ID format (e.g., "7" -> "NB007")
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
// Returns logic is now deterministic (based on Bill ID). 
// Keeping route prevents 404s if frontend calls it, but returns null.
router.get('/next-number', async (req, res) => {
  res.json({ nextReturnId: "" }); 
});

// 5. SAVE (Forces RB ID)
// Route to save a new return transaction
router.post('/save', async (req, res) => {
  const { originalBillNo, returnDate, client, items, totals } = req.body;
  try {
    // LOGIC: NB007 -> RB007
    // Automatically generates Return ID by replacing 'NB' with 'RB'
    const returnId = originalBillNo.replace("NB", "RB");

    const newReturn = new ReturnBill({ returnId, originalBillNo, returnDate, client, items, totals });
    await newReturn.save();

    // Trigger recalculation of the final bill status after saving the return
    await recalculateUpdatedBill(originalBillNo);

    res.status(201).json({ message: "Return Bill Saved", id: newReturn._id });
  } catch (err) {
    res.status(500).json({ message: "Failed to save return" });
  }
});

// 6. UPDATE
// Route to modify an existing return record
router.put('/update/:id', async (req, res) => {
  try {
    const updatedReturn = await ReturnBill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    // Recalculate bill status if the return details were changed
    if (updatedReturn) await recalculateUpdatedBill(updatedReturn.originalBillNo);
    res.json({ message: "Updated" });
  } catch (err) { res.status(500).json({ message: "Error updating" }); }
});

// 7. DELETE
// Route to delete a return record
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedReturn = await ReturnBill.findByIdAndDelete(req.params.id);
    // Recalculate bill status to revert changes after deletion
    if (deletedReturn) await recalculateUpdatedBill(deletedReturn.originalBillNo);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: "Error deleting" }); }
});

module.exports = router;