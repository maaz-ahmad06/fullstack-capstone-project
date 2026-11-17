// routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');

/**
 * Helper function to escape special regex characters.
 * Prevents Regular Expression Denial of Service (ReDoS) and Regex Injection.
 */
function escapeRegex(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

        // Task 6: Filter items by category (safely escaped against ReDoS)
        if (req.query.category && req.query.category.trim() !== '' && req.query.category.toLowerCase() !== 'all') {
            const safeCategory = escapeRegex(req.query.category.trim().slice(0, 100));
            query.category = { $regex: safeCategory, $options: 'i' };
        }

        // Optional filter: Name search (case-insensitive literal substring match)
        if (req.query.name && req.query.name.trim() !== '') {
            const safeName = escapeRegex(req.query.name.trim().slice(0, 100));
            query.name = { $regex: safeName, $options: 'i' };
        }

        // Optional filter: Item age in years (strictly parsed and validated)
        if (req.query.age_years) {
            const parsedAge = parseFloat(req.query.age_years);
            if (!isNaN(parsedAge) && parsedAge >= 0) {
                query.age_years = { $lte: parsedAge };
            }
        }

        // Optional filter: Condition
        if (req.query.condition && req.query.condition.trim() !== '' && req.query.condition.toLowerCase() !== 'all') {
            const safeCondition = escapeRegex(req.query.condition.trim().slice(0, 50));
            query.condition = { $regex: safeCondition, $options: 'i' };
        }

        // Optional filter: Zipcode
        if (req.query.zipcode && req.query.zipcode.trim() !== '') {
            const safeZipcode = req.query.zipcode.trim().slice(0, 20);
            query.zipcode = safeZipcode;
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
