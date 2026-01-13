// Import the Mongoose library
const mongoose = require('mongoose');

// Define a sub-schema for individual items (to be embedded in the Product schema)
const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Copper Wire 0.75 mm"
  unit: { type: String, default: "meter" }, // Default unit of measurement
  price: { type: Number, required: true } // Fixed Price
});

// Define the main schema that groups items by category
const ProductSchema = new mongoose.Schema({
  category: { type: String, required: true }, // e.g., "Wire"
  // Array that contains a list of items based on the ItemSchema defined above
  items: [ItemSchema]
});

// Export the 'Product' model for use in the database
module.exports = mongoose.model('Product', ProductSchema);