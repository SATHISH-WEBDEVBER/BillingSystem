const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const returnRoutes = require('./routes/returnRoutes'); // Import

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
const productRoutes = require('./routes/productRoutes');
const billRoutes = require('./routes/billRoutes');

app.use('/api/products', productRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/returns', returnRoutes); // <--- CRITICAL FIX ADDED HERE

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));