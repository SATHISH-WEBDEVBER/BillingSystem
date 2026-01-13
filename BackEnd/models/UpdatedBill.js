// Import the Mongoose library
const mongoose = require('mongoose');

// Define the schema for bills that have been updated after a return/exchange
const updatedBillSchema = new mongoose.Schema({
  // CHANGED: String type to support "UB001"
  // Unique identifier for this new, updated bill
  updatedBillId: { type: String, required: true, unique: true },
  
  // Reference to the very first original bill number
  originalBillNo: { type: String, required: true },
  
  // Reference to the specific return transaction ID that caused this update
  returnId: { type: String, required: true },
  
  // Date of the updated transaction
  date: { type: String, required: true },
  
  // Client details (snapshots the client info at the time of update)
  client: {
    name: String,
    mobile: String,
    address: String
  },
  
  // List of final items remaining in the bill after the update
  items: [
    {
      category: String,
      desc: String,
      qty: Number,
      rate: Number,
      unit: String,
      amount: Number
    }
  ],
  
  // Final calculated totals for the updated bill
  totals: {
    subTotal: String,
    roundOff: String,
    netAmount: String
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Export the 'UpdatedBill' model
module.exports = mongoose.model('UpdatedBill', updatedBillSchema);