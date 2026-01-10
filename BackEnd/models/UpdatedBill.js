const mongoose = require('mongoose');

const updatedBillSchema = new mongoose.Schema({
  updatedBillId: { type: String, required: true, unique: true }, // e.g. "UPD-15"
  originalBillNo: { type: Number, required: true },
  returnId: { type: Number, required: true },
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