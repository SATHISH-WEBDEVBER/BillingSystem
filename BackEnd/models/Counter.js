// Import the Mongoose library to interact with MongoDB
const mongoose = require('mongoose');

// Define a schema specifically for tracking sequence numbers (used for auto-incrementing)
const CounterSchema = new mongoose.Schema({
  // The identifier for the specific counter (e.g., "billId")
  id: { type: String, required: true },
  
  // The current sequence number, initialized with a specific starting value
  seq: { type: Number, default: 20740 } // Starting Bill Number
});

// Export the Counter model to be used in the application
module.exports = mongoose.model('Counter', CounterSchema);