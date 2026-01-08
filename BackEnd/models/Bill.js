const mongoose = require('mongoose');

const BillSchema = new mongoose.Schema({
  billNo: { type: Number, required: true },
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
      unit: String,
      rate: Number,
      amount: Number
    }
  ],
  totals: {
    subTotal: String,
    netAmount: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Bill', BillSchema);