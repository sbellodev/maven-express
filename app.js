const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');

// Middleware and other app configurations

// Use the user routes
app.use('/api', userRoutes);

module.exports = app;