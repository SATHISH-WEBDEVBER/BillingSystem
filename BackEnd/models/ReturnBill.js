// Import the Mongoose library
const mongoose = require('mongoose');

// Define the schema for handling returned bills
const returnBillSchema = new mongoose.Schema({
  // CHANGED: String type to support "RB001"
  // Unique identifier for the return transaction
  returnId: { type: String, required: true, unique: true },
  
  // Stores the ID of the original sales bill for reference
  originalBillNo: { type: String, required: true }, // Links to "NB001"
  
  // The date when the return was processed
  returnDate: { type: String, required: true },
  
  // Nested object containing details of the client returning items
  client: {
    name: String,
    mobile: String,
    address: String
  },
  
  // Array of items being returned
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
  
  // Object to store the calculated refund totals
  totals: {
    subTotal: String,
    roundOff: String,
    netAmount: String
  }
}, { timestamps: true }); // Automatically manages createdAt and updatedAt timestamps

// Export the 'ReturnBill' model based on the schema
module.exports = mongoose.model('ReturnBill', returnBillSchema);