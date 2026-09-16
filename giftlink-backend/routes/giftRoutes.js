// routes/giftRoutes.js
const express = require('express');
const router = express.Router();
// Task 5 requirement: includes a database connection using connectToDatabase()
const connectToDatabase = require('../models/db');

/**
 * Route: GET /api/gifts
 * Task 5 requirement: routes serving /api/gifts
 * Returns all gift items from MongoDB
 */
router.get('/', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('gifts');
        const gifts = await collection.find({}).toArray();
        return res.status(200).json(gifts);
    } catch (error) {
        console.error("Error fetching all gifts:", error);
        return res.status(500).json({ error: "Internal Server Error fetching gift listings." });
    }
});

/**
 * Route: GET /api/gifts/:id
 * Task 5 requirement: routes serving /api/gifts/:id
 * Returns a single gift item by id
 */
router.get('/:id', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('gifts');
        const id = req.params.id;
        
        // Find by string id or MongoDB _id
        const gift = await collection.findOne({ id: id });
        
        if (!gift) {
            return res.status(404).json({ error: `Gift with id ${id} not found.` });
        }
        
        return res.status(200).json(gift);
    } catch (error) {
        console.error(`Error fetching gift with id ${req.params.id}:`, error);
        return res.status(500).json({ error: "Internal Server Error fetching item details." });
    }
});

/**
 * Route: POST /api/gifts
 * Adds a new gift item
 */
router.post('/', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('gifts');
        const newGift = req.body;
        
        if (!newGift.name || !newGift.category) {
            return res.status(400).json({ error: "Name and Category are required fields." });
        }
        
        // Assign a unique id if not provided
        if (!newGift.id) {
            newGift.id = (Date.now()).toString();
        }
        newGift.posted_date = newGift.posted_date || Math.floor(Date.now() / 1000);
        newGift.comments = newGift.comments || [];

        const result = await collection.insertOne(newGift);
        return res.status(201).json({ message: "Gift added successfully", gift: newGift, insertedId: result.insertedId });
    } catch (error) {
        console.error("Error creating new gift:", error);
        return res.status(500).json({ error: "Failed to create gift item." });
    }
});

/**
 * Route: POST /api/gifts/:id/comments
 * Adds a comment to a gift item
 */
router.post('/:id/comments', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('gifts');
        const id = req.params.id;
        const { author, comment, rating } = req.body;

        const newComment = {
            author: author || "Anonymous",
            comment,
            rating: rating || 5,
            createdAt: new Date().toISOString()
        };

        const updateResult = await collection.updateOne(
            { id: id },
            { $push: { comments: newComment } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: "Gift not found" });
        }

        return res.status(201).json({ message: "Comment added successfully", comment: newComment });
    } catch (error) {
        console.error("Error adding comment:", error);
        return res.status(500).json({ error: "Failed to add comment." });
    }
});

module.exports = router;
