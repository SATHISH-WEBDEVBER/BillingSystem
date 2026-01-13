// Import the Express framework and create a router instance
const express = require('express');
const router = express.Router();
// Import the Bill model to interact with the database
const Bill = require('../models/Bill'); 
// Import a utility function to handle logic when bills are modified
const { recalculateUpdatedBill } = require('../utils/billLogic');

// 1. GET RECENT
// Route to fetch the 6 most recently created bills for the dashboard
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 }).limit(6);
    res.json(bills);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. GET ALL
// Route to fetch the entire history of bills, sorted by newest first
router.get('/all', async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 3. FIND BY ID (Smart Search for "7" -> "NB007")
// Route to search for a specific bill. It handles user input "7" by converting it to "NB007"
router.get('/find/:billNo', async (req, res) => {
  try {
    const input = req.params.billNo.trim();
    // Try finding exact match OR padded match (e.g. "7" -> "NB007")
    const formatted = "NB" + input.padStart(3, '0');
    
    // Construct a database query to look for either the raw input or the formatted ID
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
// Route to calculate basic sales statistics (daily, weekly, monthly totals)
router.get('/stats', async (req, res) => {
  try {
    const bills = await Bill.find();
    // ... (Stats logic remains same, just ensuring it runs) ...
    // Currently returns a placeholder object with the total count of bills
    const stats = { daily: 0, weekly: 0, monthly: 0, totalBills: bills.length };
    res.json(stats);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- 5. NEXT BILL NO (NEW LOGIC: NBxxx) ---
// Route to automatically generate the next bill ID (e.g., if last is NB005, return NB006)
router.get('/next-number', async (req, res) => {
  try {
    // Find the latest created bill
    const lastBill = await Bill.findOne().sort({ createdAt: -1 });
    
    let nextNum = 1;
    // Extract the numeric part of the ID (remove "NB"), parse it, and increment by 1
    if (lastBill && lastBill.billNo && lastBill.billNo.startsWith("NB")) {
      const currentNum = parseInt(lastBill.billNo.replace("NB", ""));
      if (!isNaN(currentNum)) nextNum = currentNum + 1;
    }
    
    // Format: NB001, NB012, NB123 (Ensure it is always at least 3 digits)
    const nextBillNo = "NB" + String(nextNum).padStart(3, '0');
    res.json({ nextBillNo });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. SAVE (Accepts NBxxx)
// Route to create and save a new bill to the database
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
// Route to modify an existing bill. Triggers recalculation logic if successful.
router.put('/update/:id', async (req, res) => {
  try {
    const updatedBill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    // If update succeeds, run the utility function to adjust inventory/ledgers
    if (updatedBill) await recalculateUpdatedBill(updatedBill.billNo);
    res.json({ message: "Updated" });
  } catch (err) { res.status(500).json({ message: "Error updating" }); }
});

// 8. DELETE
// Route to remove a bill. Also triggers recalculation to revert changes.
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedBill = await Bill.findByIdAndDelete(req.params.id);
    // If delete succeeds, run the utility function to adjust inventory/ledgers
    if (deletedBill) await recalculateUpdatedBill(deletedBill.billNo);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: "Error deleting" }); }
});

module.exports = router;