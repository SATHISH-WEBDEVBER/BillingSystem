const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Copper Wire 0.75 mm"
  unit: { type: String, default: "meter" },
  price: { type: Number, required: true } // Fixed Price
});

const ProductSchema = new mongoose.Schema({
  category: { type: String, required: true }, // e.g., "Wire"
  items: [ItemSchema]
});

module.exports = mongoose.model('Product', ProductSchema);