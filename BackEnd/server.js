const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

const productRoutes = require('./routes/productRoutes');
const billRoutes = require('./routes/billRoutes');
const returnRoutes = require('./routes/returnRoutes');
const updatedBillRoutes = require('./routes/updatedBillRoutes'); // NEW

app.use('/api/products', productRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/updated', updatedBillRoutes); // NEW

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));