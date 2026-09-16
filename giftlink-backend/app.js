// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pino = require('pino');
const pinoHttp = require('pino-http');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3060;

// Logger
const logger = pino({ level: 'info' });
app.use(pinoHttp({ logger }));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import route handlers
const giftRoutes = require('./routes/giftRoutes');
const searchRoutes = require('./routes/searchRoutes');
const authRoutes = require('./routes/authRoutes');
const sentimentRoutes = require('./sentiment/index');

// Mount routes
app.use('/api/gifts', giftRoutes);
// Task 7 requirement: app.js includes a route serving /api/search
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sentiment', sentimentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'GiftLink Backend API is running smoothly' });
});

// Root endpoint
app.get('/', (req, res) => {
    res.send('Welcome to GiftLink API Server');
});

// Global error handler
app.use((err, req, res, next) => {
    logger.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Start the Express server
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        logger.info(`GiftLink server running on http://localhost:${PORT}`);
    });
}

module.exports = app;
