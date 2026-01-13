// Import the Express framework and create a router instance
const express = require('express');
const router = express.Router();
// Import the UpdatedBill model to interact with the database
const UpdatedBill = require('../models/UpdatedBill');

// 1. GET RECENT (Limit 6)
// Route to fetch the 6 most recently created "Updated Bills" (likely for a dashboard view)
router.get('/', async (req, res) => {
  try {
    const bills = await UpdatedBill.find().sort({ createdAt: -1 }).limit(6);
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GET ALL
// Route to fetch the complete history of all "Updated Bills", sorted by newest first
router.get('/all', async (req, res) => {
  try {
    const bills = await UpdatedBill.find().sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export the router for use in the main server file
module.exports = router;