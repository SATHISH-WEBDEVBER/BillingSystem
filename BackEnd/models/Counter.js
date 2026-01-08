const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({
  id: { type: String, required: true },
  seq: { type: Number, default: 20740 } // Starting Bill Number
});

module.exports = mongoose.model('Counter', CounterSchema);