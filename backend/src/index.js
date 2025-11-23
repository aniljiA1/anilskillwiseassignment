require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productsRouter = require('./routes/products');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/products', productsRouter);

// Test Route
app.get('/', (req, res) => {
res.send('Backend is Running ✔');
});

// Start Server
const PORT = process.env.PORT || 4000;
const HOST = "0.0.0.0";
app.listen(PORT, () => console.log(`Local: http://localhost:${PORT}`));

//console.log(`Server running on port ${PORT}`));