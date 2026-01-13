// Import the Mongoose library to interact with MongoDB
const mongoose = require('mongoose');

// Define the schema structure for the Bill model
const billSchema = new mongoose.Schema({
  // CHANGED: String type to support "NB001"
  // The unique identifier for the bill (e.g., invoice number)
  billNo: { type: String, required: true, unique: true },
  
  // The date of the bill, stored as a String
  date: { type: String, required: true },
  
  // Nested object to store customer information
  client: {
    name: String,
    mobile: String,
    address: String
  },
  
  // Array containing the list of products/items in the bill
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
  
  // Object to store the final calculation details
  totals: {
    subTotal: String,
    roundOff: String,
    netAmount: String
  }
}, { timestamps: true }); // Automatically adds 'createdAt' and 'updatedAt' fields

// Create the model from the schema and export it for use in other files
module.exports = mongoose.model('Bill', billSchema);