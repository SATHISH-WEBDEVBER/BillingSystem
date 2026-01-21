const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  unit: { type: String, default: "piece" },
  price: { type: Number, required: true },
  qty: { type: Number, required: true } // CHANGED: 'qty' to match your DB, removed default 100
});

const ProductSchema = new mongoose.Schema({
  category: { type: String, required: true }, 
  items: [ItemSchema]
});

module.exports = mongoose.model('Product', ProductSchema);