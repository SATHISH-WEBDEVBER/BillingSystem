// Import the necessary libraries
const express = require('express');   // The main web framework
const mongoose = require('mongoose'); // Library to interact with MongoDB
const cors = require('cors');         // Middleware to allow cross-origin requests (frontend to backend)
require('dotenv').config();           // Loads environment variables from a .env file

// Initialize the Express application
const app = express();

// Middleware setup
app.use(cors());          // Enable CORS so your React frontend can communicate with this backend
app.use(express.json());  // Parse incoming JSON payloads in requests

// Connect to the MongoDB database using the connection string from .env
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.log(err));

// Import the separate route files
const productRoutes = require('./routes/productRoutes');
const billRoutes = require('./routes/billRoutes');
const returnRoutes = require('./routes/returnRoutes');
const updatedBillRoutes = require('./routes/updatedBillRoutes'); // NEW: Import the updated bill logic

// Define the API endpoints
app.use('/api/products', productRoutes);      // Endpoint for product management
app.use('/api/bills', billRoutes);            // Endpoint for creating/fetching bills
app.use('/api/returns', returnRoutes);        // Endpoint for handling returns
app.use('/api/updated', updatedBillRoutes);   // NEW: Endpoint for accessing updated bills

// Set the port and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));