const express = require('express');
const router = express.Router();
const ReturnBill = require('../models/ReturnBill');
const Product = require('../models/Product');
const { recalculateUpdatedBill } = require('../utils/billLogic');

// 1. GET RECENT
router.get('/', async (req, res) => {
  try { const returns = await ReturnBill.find().sort({ createdAt: -1 }).limit(6); res.json(returns); } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. GET ALL
router.get('/all', async (req, res) => {
  try { const returns = await ReturnBill.find().sort({ createdAt: -1 }); res.json(returns); } catch (err) { res.status(500).json({ message: err.message }); }
});

// 3. CHECK EXISTS
router.get('/check/:billNo', async (req, res) => {
  try {
    const input = req.params.billNo.trim();
    const formatted = "NB" + input.padStart(3, '0');
    const query = { $or: [ { originalBillNo: input }, { originalBillNo: formatted } ] };
    const existingReturn = await ReturnBill.findOne(query);
    if (existingReturn) return res.json({ exists: true, returnBill: existingReturn });
    res.json({ exists: false });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 4. NEXT NUMBER
router.get('/next-number', async (req, res) => { res.json({ nextReturnId: "" }); });

// 5. SAVE (New Return - Add Stock)
router.post('/save', async (req, res) => {
  const { originalBillNo, returnDate, client, items, totals, paymentMode } = req.body;
  try {
    const returnId = originalBillNo.replace("NB", "RB");

    // Restore Stock (Add Quantity Back)
    for (const item of items) {
      if (item.category && item.desc) {
        await Product.updateOne(
          { category: item.category, "items.name": item.desc },
          { $inc: { "items.$.qty": item.qty } } // Add qty back
        );
      }
    }

    const newReturn = new ReturnBill({ returnId, originalBillNo, returnDate, client, items, totals, paymentMode });
    await newReturn.save();

    await recalculateUpdatedBill(originalBillNo);

    res.status(201).json({ message: "Return Bill Saved", id: newReturn._id });
  } catch (err) {
    res.status(500).json({ message: "Failed to save return" });
  }
});

// 6. UPDATE (Edit Return - Adjust Stock)
router.put('/update/:id', async (req, res) => {
  try {
    // A. Find Old Return Bill
    const oldReturn = await ReturnBill.findById(req.params.id);
    if (!oldReturn) return res.status(404).json({ message: "Return Bill not found" });

    const newItems = req.body.items;

    // B. REVERSE OLD RETURN EFFECT (Subtract Stock)
    // Because we originally ADDED stock when we created this return,
    // to edit it, we must first undo that add (by subtracting).
    for (const oldItem of oldReturn.items) {
      if (oldItem.category && oldItem.desc) {
        await Product.updateOne(
          { category: oldItem.category, "items.name": oldItem.desc },
          { $inc: { "items.$.qty": -oldItem.qty } } // Subtract logic
        );
      }
    }

    // C. APPLY NEW RETURN EFFECT (Add Stock)
    for (const newItem of newItems) {
      if (newItem.category && newItem.desc) {
        await Product.updateOne(
          { category: newItem.category, "items.name": newItem.desc },
          { $inc: { "items.$.qty": newItem.qty } } // Add logic
        );
      }
    }

    // D. Update Return Document
    const updatedReturn = await ReturnBill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // E. Trigger UB Logic
    if (updatedReturn) await recalculateUpdatedBill(updatedReturn.originalBillNo);
    
    res.json({ message: "Updated" });

  } catch (err) { 
    res.status(500).json({ message: "Error updating" }); 
  }
});

// 7. DELETE (Undo Return Stock)
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedReturn = await ReturnBill.findByIdAndDelete(req.params.id);
    
    // REVERSE STOCK ADDITION (Subtract Stock)
    if (deletedReturn && deletedReturn.items) {
      for (const item of deletedReturn.items) {
        if (item.category && item.desc) {
          await Product.updateOne(
            { category: item.category, "items.name": item.desc },
            { $inc: { "items.$.qty": -item.qty } } // Subtract back
          );
        }
      }
    }

    if (deletedReturn) await recalculateUpdatedBill(deletedReturn.originalBillNo);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: "Error deleting" }); }
});

module.exports = router;