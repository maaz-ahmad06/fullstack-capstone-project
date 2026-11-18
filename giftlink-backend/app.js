// app.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const pino = require('pino');
const pinoHttp = require('pino-http');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3060;

// Logger
const logger = pino({ level: 'info' });
app.use(pinoHttp({ logger }));

// Security Headers with Helmet
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Global Rate Limiting: 200 requests per 15 minutes per IP
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Stricter Auth Rate Limiting for Login & Registration (Brute-force protection)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    message: { error: 'Too many authentication attempts from this IP, please try again after 15 minutes.' }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiters
app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Serve uploaded item images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import route handlers
const giftRoutes = require('./routes/giftRoutes');
const searchRoutes = require('./routes/searchRoutes');
const authRoutes = require('./routes/authRoutes');
const sentimentRoutes = require('./sentiment/index');
const requestRoutes = require('./routes/requestRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Mount routes
app.use('/api/gifts', giftRoutes);
// Task 7 requirement: app.js includes a route serving /api/search
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sentiment', sentimentRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/upload', uploadRoutes);

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
