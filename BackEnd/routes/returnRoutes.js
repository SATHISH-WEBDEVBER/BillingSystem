const express = require('express');
const router = express.Router();
const ReturnBill = require('../models/ReturnBill');
const Counter = require('../models/Counter'); 

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

// --- NEW: CHECK IF RETURN EXISTS ---
router.get('/check/:billNo', async (req, res) => {
  try {
    const searchInput = req.params.billNo.trim();
    
    // Check for both String and Number to be safe
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

// 4. GET NEXT RETURN ID
router.get('/next-number', async (req, res) => {
  try {
    let counter = await Counter.findOne({ id: 'returnId' });
    if (!counter) {
      counter = new Counter({ id: 'returnId', seq: 100 }); 
      await counter.save();
    }
    res.json({ nextReturnId: counter.seq + 1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. SAVE RETURN BILL
router.post('/save', async (req, res) => {
  const { originalBillNo, returnDate, client, items, totals } = req.body;

  try {
    let counter = await Counter.findOne({ id: 'returnId' });
    if (!counter) {
        counter = new Counter({ id: 'returnId', seq: 100 });
        await counter.save();
    }
    const returnId = counter.seq + 1;

    const newReturn = new ReturnBill({
      returnId,
      originalBillNo,
      returnDate,
      client,
      items,
      totals
    });

    await newReturn.save();
    await Counter.findOneAndUpdate({ id: 'returnId' }, { $inc: { seq: 1 } });

    res.status(201).json({ message: "Return Bill Saved", id: newReturn._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save return" });
  }
});

// 6. UPDATE RETURN BILL
router.put('/update/:id', async (req, res) => {
  try {
    await ReturnBill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Return Bill Updated Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update return bill" });
  }
});

// 7. DELETE RETURN BILL
router.delete('/delete/:id', async (req, res) => {
  try {
    await ReturnBill.findByIdAndDelete(req.params.id);
    res.json({ message: "Return Bill Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete return bill" });
  }
});

module.exports = router;