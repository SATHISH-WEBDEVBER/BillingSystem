const mongoose = require('mongoose');

const returnBillSchema = new mongoose.Schema({
  returnId: { type: Number, required: true, unique: true }, // Sequence for returns (e.g., 1, 2, 3...)
  originalBillNo: { type: String, required: true }, // Link to original bill
  returnDate: { type: String, required: true },
  client: {
    name: String,
    mobile: String,
    address: String
  },
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
  totals: {
    subTotal: String,
    roundOff: String,
    netAmount: String
  }
}, { timestamps: true });

module.exports = mongoose.model('ReturnBill', returnBillSchema);