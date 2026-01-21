const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill'); 
const ReturnBill = require('../models/ReturnBill'); 
const Product = require('../models/Product'); 
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
    const query = { $or: [ { billNo: input }, { billNo: formatted } ] };
    const bill = await Bill.findOne(query);
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  } catch (err) { res.status(500).json({ message: "Server error" }); }
});

// 4. STATS (Overview)
router.get('/stats', async (req, res) => {
  try {
    const bills = await Bill.find();
    const returns = await ReturnBill.find(); 
    const now = new Date();
    const toDateString = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const todayStr = toDateString(now);
    
    const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfWeekStr = toDateString(startOfWeek);
    const startOfMonthStr = toDateString(new Date(now.getFullYear(), now.getMonth(), 1));

    let stats = { daily: 0, weekly: 0, monthly: 0, totalBills: bills.length };

    // Add Sales
    bills.forEach(bill => {
      const d = bill.date;
      const amt = Number(bill.totals.netAmount) || 0;
      if (d === todayStr) stats.daily += amt;
      if (d >= startOfWeekStr && d <= todayStr) stats.weekly += amt;
      if (d >= startOfMonthStr && d <= todayStr) stats.monthly += amt;
    });

    // Subtract Returns
    returns.forEach(ret => {
      const d = ret.returnDate;
      const amt = Number(ret.totals.netAmount) || 0;
      if (d === todayStr) stats.daily -= amt;
      if (d >= startOfWeekStr && d <= todayStr) stats.weekly -= amt;
      if (d >= startOfMonthStr && d <= todayStr) stats.monthly -= amt;
    });

    res.json(stats);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- CUSTOM SALES ANALYTICS ---
router.post('/custom-stats', async (req, res) => {
  try {
    const { type, value } = req.body; 
    const bills = await Bill.find();
    const returns = await ReturnBill.find();
    let totalSales = 0;

    const isDateInWeek = (dateStr, weekStr) => {
        if (!dateStr || !weekStr) return false;
        const d = new Date(dateStr);
        const dateYear = d.getFullYear();
        const tdt = new Date(d.valueOf());
        const dayn = (d.getDay() + 6) % 7;
        tdt.setDate(tdt.getDate() - dayn + 3);
        const firstThursday = tdt.valueOf();
        tdt.setMonth(0, 1);
        if (tdt.getDay() !== 4) tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
        const weekNum = 1 + Math.ceil((firstThursday - tdt) / 604800000);
        return `${dateYear}-W${String(weekNum).padStart(2, '0')}` === weekStr;
    };

    bills.forEach(bill => {
      const d = bill.date;
      const amt = Number(bill.totals.netAmount) || 0;
      let match = false;
      if (type === 'day' && d === value) match = true;
      if (type === 'month' && d.startsWith(value)) match = true;
      if (type === 'week' && isDateInWeek(d, value)) match = true;
      if (match) totalSales += amt;
    });

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
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// --- PRODUCT SALES ANALYTICS (FIXED: Subtract Returns) ---
router.post('/product-stats', async (req, res) => {
  try {
    const { type, value } = req.body;
    const bills = await Bill.find();
    const returns = await ReturnBill.find(); // Fetch Returns
    
    let productMap = {};

    const isDateInWeek = (dateStr, weekStr) => {
        if (!dateStr || !weekStr) return false;
        const d = new Date(dateStr);
        const dateYear = d.getFullYear();
        const tdt = new Date(d.valueOf());
        const dayn = (d.getDay() + 6) % 7;
        tdt.setDate(tdt.getDate() - dayn + 3);
        const firstThursday = tdt.valueOf();
        tdt.setMonth(0, 1);
        if (tdt.getDay() !== 4) tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
        const weekNum = 1 + Math.ceil((firstThursday - tdt) / 604800000);
        return `${dateYear}-W${String(weekNum).padStart(2, '0')}` === weekStr;
    };

    // 1. ADD from Bills (Sales)
    bills.forEach(bill => {
      const d = bill.date;
      let match = false;
      if (type === 'day' && d === value) match = true;
      if (type === 'month' && d.startsWith(value)) match = true;
      if (type === 'week' && isDateInWeek(d, value)) match = true;

      if (match && bill.items) {
        bill.items.forEach(item => {
          if (!productMap[item.desc]) {
            productMap[item.desc] = { qty: 0, category: item.category, unit: item.unit };
          }
          productMap[item.desc].qty += Number(item.qty) || 0;
        });
      }
    });

    // 2. SUBTRACT from Returns (Net Sales)
    returns.forEach(ret => {
      const d = ret.returnDate;
      let match = false;
      if (type === 'day' && d === value) match = true;
      if (type === 'month' && d.startsWith(value)) match = true;
      if (type === 'week' && isDateInWeek(d, value)) match = true;

      if (match && ret.items) {
        ret.items.forEach(item => {
          // Note: Usually the product exists because it was sold first, 
          // but we check just in case.
          if (!productMap[item.desc]) {
            productMap[item.desc] = { qty: 0, category: item.category, unit: item.unit };
          }
          // Subtract the returned quantity
          productMap[item.desc].qty -= Number(item.qty) || 0;
        });
      }
    });

    // Convert map to array
    const productList = Object.keys(productMap).map(key => ({
      name: key,
      qty: productMap[key].qty,
      category: productMap[key].category,
      unit: productMap[key].unit
    }));

    res.json(productList);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 5. NEXT BILL NO
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
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 6. SAVE (New Bill - Deduct Stock)
router.post('/save', async (req, res) => {
  const { billNo, date, client, items, totals, paymentMode } = req.body;
  
  try {
    // 1. Validate Stock
    for (const item of items) {
      if (item.category && item.desc) {
        const productCat = await Product.findOne({ category: item.category });
        if (productCat) {
          const productItem = productCat.items.find(i => i.name === item.desc);
          if (productItem && productItem.qty < item.qty) {
            return res.status(400).json({ 
              message: `Not enough stock for ${item.desc}. Available: ${productItem.qty}` 
            });
          }
        }
      }
    }

    // 2. Deduct Stock
    for (const item of items) {
      if (item.category && item.desc) {
        await Product.updateOne(
          { category: item.category, "items.name": item.desc },
          { $inc: { "items.$.qty": -item.qty } } 
        );
      }
    }

    // 3. Save Bill
    const newBill = new Bill({ billNo, date, client, items, totals, paymentMode });
    await newBill.save();
    res.status(201).json({ message: "Saved", id: newBill._id });

  } catch (err) {
    res.status(500).json({ message: err.message || "Error saving" });
  }
});

// 7. UPDATE (Edit Bill - Re-calculate Stock)
router.put('/update/:id', async (req, res) => {
  try {
    const oldBill = await Bill.findById(req.params.id);
    if (!oldBill) return res.status(404).json({ message: "Bill not found" });

    const newItems = req.body.items;

    // Validation
    for (const newItem of newItems) {
      if (newItem.category && newItem.desc) {
        const productCat = await Product.findOne({ category: newItem.category });
        const productItem = productCat?.items.find(i => i.name === newItem.desc);
        
        if (productItem) {
          const oldItem = oldBill.items.find(i => i.desc === newItem.desc);
          const oldQty = oldItem ? oldItem.qty : 0;
          const availableVirtual = productItem.qty + oldQty;

          if (newItem.qty > availableVirtual) {
            return res.status(400).json({
              message: `Cannot update. ${newItem.desc}: Need ${newItem.qty}, but only ${availableVirtual} available.`
            });
          }
        }
      }
    }

    // Restore Old Stock
    for (const oldItem of oldBill.items) {
      if (oldItem.category && oldItem.desc) {
        await Product.updateOne(
          { category: oldItem.category, "items.name": oldItem.desc },
          { $inc: { "items.$.qty": oldItem.qty } } 
        );
      }
    }

    // Deduct New Stock
    for (const newItem of newItems) {
      if (newItem.category && newItem.desc) {
        await Product.updateOne(
          { category: newItem.category, "items.name": newItem.desc },
          { $inc: { "items.$.qty": -newItem.qty } } 
        );
      }
    }

    const updatedBill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (updatedBill) await recalculateUpdatedBill(updatedBill.billNo);
    
    res.json({ message: "Updated" });

  } catch (err) { 
    res.status(500).json({ message: err.message || "Error updating" }); 
  }
});

// 8. DELETE (Restore Stock)
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedBill = await Bill.findByIdAndDelete(req.params.id);
    
    if (deletedBill && deletedBill.items) {
      for (const item of deletedBill.items) {
        if (item.category && item.desc) {
          await Product.updateOne(
            { category: item.category, "items.name": item.desc },
            { $inc: { "items.$.qty": item.qty } } 
          );
        }
      }
    }

    if (deletedBill) await recalculateUpdatedBill(deletedBill.billNo);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ message: "Error deleting" }); }
});

module.exports = router;