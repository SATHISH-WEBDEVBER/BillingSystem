const mongoose = require('mongoose');

const returnBillSchema = new mongoose.Schema({
  // CHANGED: String type to support "RB001"
  returnId: { type: String, required: true, unique: true },
  originalBillNo: { type: String, required: true }, // Links to "NB001"
  returnDate: { type: String, required: true },
  paymentMode: { type: String, default: "Credit" }, // NEW FIELD
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