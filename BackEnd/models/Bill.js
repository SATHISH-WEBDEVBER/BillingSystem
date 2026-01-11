const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  // CHANGED: String type to support "NB001"
  billNo: { type: String, required: true, unique: true },
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

module.exports = mongoose.model('Bill', billSchema);