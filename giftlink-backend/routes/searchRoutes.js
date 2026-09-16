// routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');

/**
 * Route: GET /api/search
 * Task 6 requirement: code to filter items by category
 */
router.get('/', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('gifts');

        // Initialize empty query object
        const query = {};

        // Task 6: Filter items by category
        if (req.query.category && req.query.category.trim() !== '' && req.query.category !== 'all') {
            query.category = { $regex: req.query.category.trim(), $options: 'i' };
        }

        // Optional filter: Name search (case-insensitive substring match)
        if (req.query.name && req.query.name.trim() !== '') {
            query.name = { $regex: req.query.name.trim(), $options: 'i' };
        }

        // Optional filter: Item age in years
        if (req.query.age_years) {
            query.age_years = { $lte: parseFloat(req.query.age_years) };
        }

        // Optional filter: Condition
        if (req.query.condition && req.query.condition.trim() !== '') {
            query.condition = { $regex: req.query.condition.trim(), $options: 'i' };
        }

        // Optional filter: Zipcode
        if (req.query.zipcode && req.query.zipcode.trim() !== '') {
            query.zipcode = req.query.zipcode.trim();
        }

        // Fetch matching items from database
        const gifts = await collection.find(query).toArray();
        return res.status(200).json(gifts);
    } catch (error) {
        console.error("Error executing search query:", error);
        return res.status(500).json({ error: "Failed to perform search." });
    }
});

module.exports = router;
