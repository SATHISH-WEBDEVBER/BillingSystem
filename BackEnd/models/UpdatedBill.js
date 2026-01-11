const mongoose = require('mongoose');

const updatedBillSchema = new mongoose.Schema({
  // CHANGED: String type to support "UB001"
  updatedBillId: { type: String, required: true, unique: true },
  originalBillNo: { type: String, required: true },
  returnId: { type: String, required: true },
  date: { type: String, required: true },
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

module.exports = mongoose.model('UpdatedBill', updatedBillSchema);