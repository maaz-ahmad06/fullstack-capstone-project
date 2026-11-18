// routes/giftRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
// Task 5 requirement: includes a database connection using connectToDatabase()
const connectToDatabase = require('../models/db');
const authenticateToken = require('../middleware/authMiddleware');
const { ObjectId } = require('mongodb');

const JWT_SECRET = process.env.JWT_SECRET || 'giftlink_jwt_super_secret_key_2026';

/**
 * Helper to build ID query supporting both custom string id and MongoDB ObjectId
 */
function buildIdQuery(id) {
    if (ObjectId.isValid(id)) {
        return {
            $or: [
                { id: id },
                { _id: new ObjectId(id) },
                { _id: id }
            ]
        };
    }
    return {
        $or: [
            { id: id },
            { _id: id }
        ]
    };
}

/**
 * Helper to optionally extract authenticated user from Authorization header
 * Used when an endpoint allows both guests and logged-in users (e.g., donating an item)
 */
function getOptionalUser(req) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        if (token) {
            try {
                return jwt.verify(token, JWT_SECRET);
            } catch (err) {
                return null;
            }
        }
    }
    return null;
}

/**
 * Helper to escape regex special characters for safe MongoDB regex queries
 */
function escapeRegex(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Route: GET /api/gifts
 * Task 5 requirement: routes serving /api/gifts
 * Supports optional server-side pagination, filtering & sorting via ?page=&limit=&category=&condition=&search=&sort=
 * Returns a plain array when called without pagination params for backward compatibility.
 */
router.get('/', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('gifts');

        const isPaginated = req.query.page !== undefined || req.query.limit !== undefined;

        if (!isPaginated) {
            const gifts = await collection.find({}).toArray();
            return res.status(200).json(gifts);
        }

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 6));

        // Build safe filter query
        const query = {};
        if (req.query.category && req.query.category.trim() !== '' && req.query.category.toLowerCase() !== 'all') {
            query.category = { $regex: `^${escapeRegex(req.query.category.trim().slice(0, 100))}$`, $options: 'i' };
        }
        if (req.query.condition && req.query.condition.trim() !== '' && req.query.condition.toLowerCase() !== 'all') {
            query.condition = { $regex: `^${escapeRegex(req.query.condition.trim().slice(0, 50))}$`, $options: 'i' };
        }
        if (req.query.search && req.query.search.trim() !== '') {
            const safeSearch = escapeRegex(req.query.search.trim().slice(0, 100));
            query.$or = [
                { name: { $regex: safeSearch, $options: 'i' } },
                { description: { $regex: safeSearch, $options: 'i' } },
                { category: { $regex: safeSearch, $options: 'i' } }
            ];
        }

        // Build sort specification
        let sortSpec = { posted_date: -1 };
        if (req.query.sort === 'oldest') {
            sortSpec = { posted_date: 1 };
        } else if (req.query.sort === 'name') {
            sortSpec = { name: 1 };
        }

        const total = await collection.countDocuments(query);
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const safePage = Math.min(page, totalPages);
        const skip = (safePage - 1) * limit;

        const gifts = await collection
            .find(query)
            .sort(sortSpec)
            .skip(skip)
            .limit(limit)
            .toArray();

        return res.status(200).json({
            gifts,
            pagination: {
                total,
                page: safePage,
                limit,
                totalPages,
                hasNextPage: safePage < totalPages,
                hasPrevPage: safePage > 1
            }
        });
    } catch (error) {
        console.error("Error fetching all gifts:", error);
        return res.status(500).json({ error: "Internal Server Error fetching gift listings." });
    }
});

/**
 * Route: GET /api/gifts/my-gifts
 * Protected Route: Returns all gift listings created by the authenticated user
 */
router.get('/my-gifts', authenticateToken, async (req, res) => {
    try {
        const userEmail = req.user.email?.toLowerCase();
        if (!userEmail) {
            return res.status(400).json({ error: "User email missing from token." });
        }

        const db = await connectToDatabase();
        const collection = db.collection('gifts');
        const myGifts = await collection.find({ donorEmail: userEmail }).toArray();
        return res.status(200).json(myGifts);
    } catch (error) {
        console.error("Error fetching user's listed gifts:", error);
        return res.status(500).json({ error: "Failed to fetch your gift listings." });
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
        const gift = await collection.findOne(buildIdQuery(id));
        
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
 * Adds a new gift item and attaches donor ownership if authenticated
 */
router.post('/', async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('gifts');
        const body = req.body;
        
        if (!body.name || !body.category) {
            return res.status(400).json({ error: "Name and Category are required fields." });
        }

        // Attach verified donor info if user is authenticated
        const authUser = getOptionalUser(req);

        const newGift = {
            id: body.id || Date.now().toString(),
            name: body.name.trim(),
            category: body.category,
            condition: body.condition || 'Good',
            age_years: body.age_years !== undefined ? parseFloat(body.age_years) : 1,
            zipcode: body.zipcode || '10001',
            image: body.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
            description: body.description || '',
            posted_date: body.posted_date || Math.floor(Date.now() / 1000),
            comments: body.comments || [],
            status: 'Available',
            donorId: authUser ? authUser.id : null,
            donorEmail: authUser ? authUser.email.toLowerCase() : null,
            donorName: authUser ? (body.donorName || authUser.firstName || 'Community Donor') : (body.donorName || 'Guest Donor')
        };

        const result = await collection.insertOne(newGift);
        return res.status(201).json({ 
            message: "Gift added successfully", 
            gift: newGift, 
            insertedId: result.insertedId 
        });
    } catch (error) {
        console.error("Error creating new gift:", error);
        return res.status(500).json({ error: "Failed to create gift item." });
    }
});

/**
 * Route: PUT /api/gifts/:id
 * Protected Route: Updates a gift item (only allowed for the original donor)
 */
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('gifts');
        const id = req.params.id;
        const userEmail = req.user.email?.toLowerCase();

        const existingGift = await collection.findOne(buildIdQuery(id));
        if (!existingGift) {
            return res.status(404).json({ error: "Gift listing not found." });
        }

        // Verify ownership
        if (!existingGift.donorEmail || existingGift.donorEmail.toLowerCase() !== userEmail) {
            return res.status(403).json({ error: "Forbidden: You can only edit your own gift listings." });
        }

        const { name, category, condition, age_years, zipcode, image, description, status } = req.body;
        const updateFields = {};

        if (name !== undefined && name.trim()) updateFields.name = name.trim();
        if (category !== undefined) updateFields.category = category;
        if (condition !== undefined) updateFields.condition = condition;
        if (age_years !== undefined && !isNaN(parseFloat(age_years))) updateFields.age_years = parseFloat(age_years);
        if (zipcode !== undefined) updateFields.zipcode = zipcode.trim();
        if (image !== undefined && image.trim()) updateFields.image = image.trim();
        if (description !== undefined) updateFields.description = description.trim();
        if (status !== undefined && ['Available', 'Pending', 'Claimed'].includes(status)) {
            updateFields.status = status;
        }
        updateFields.updatedAt = new Date().toISOString();

        await collection.updateOne(
            buildIdQuery(id),
            { $set: updateFields }
        );

        const updatedGift = { ...existingGift, ...updateFields };
        return res.status(200).json({
            message: "Gift listing updated successfully.",
            gift: updatedGift
        });
    } catch (error) {
        console.error(`Error updating gift ${req.params.id}:`, error);
        return res.status(500).json({ error: "Failed to update gift listing." });
    }
});

/**
 * Route: DELETE /api/gifts/:id
 * Protected Route: Deletes a gift item (only allowed for the original donor)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const db = await connectToDatabase();
        const collection = db.collection('gifts');
        const id = req.params.id;
        const userEmail = req.user.email?.toLowerCase();

        const existingGift = await collection.findOne(buildIdQuery(id));
        if (!existingGift) {
            return res.status(404).json({ error: "Gift listing not found." });
        }

        // Verify ownership
        if (!existingGift.donorEmail || existingGift.donorEmail.toLowerCase() !== userEmail) {
            return res.status(403).json({ error: "Forbidden: You can only delete your own gift listings." });
        }

        await collection.deleteOne(buildIdQuery(id));

        return res.status(200).json({ message: "Gift listing deleted successfully." });
    } catch (error) {
        console.error(`Error deleting gift ${req.params.id}:`, error);
        return res.status(500).json({ error: "Failed to delete gift listing." });
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

        if (!comment) {
            return res.status(400).json({ error: "Comment text is required." });
        }

        const newComment = {
            author: author || "Community Member",
            comment,
            rating: rating || 5,
            createdAt: new Date().toISOString()
        };

        const updateResult = await collection.updateOne(
            buildIdQuery(id),
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
