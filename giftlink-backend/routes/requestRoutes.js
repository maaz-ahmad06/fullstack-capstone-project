// routes/requestRoutes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const connectToDatabase = require('../models/db');
const authenticateToken = require('../middleware/authMiddleware');

const JWT_SECRET = process.env.JWT_SECRET || 'giftlink_jwt_super_secret_key_2026';

/**
 * Helper to build ID query supporting custom string id and MongoDB ObjectId
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
 * Route: POST /api/requests
 * Submit a claim/pickup request for a gift item
 */
router.post('/', async (req, res) => {
    try {
        const { giftId, requesterName, requesterContact, message } = req.body;

        if (!giftId || !requesterName?.trim() || !requesterContact?.trim() || !message?.trim()) {
            return res.status(400).json({
                error: "Gift ID, your name, contact info, and a message are all required."
            });
        }

        const db = await connectToDatabase();
        const giftsCollection = db.collection('gifts');
        const requestsCollection = db.collection('requests');

        const gift = await giftsCollection.findOne(buildIdQuery(giftId));
        if (!gift) {
            return res.status(404).json({ error: "Gift listing not found." });
        }

        if (gift.status === 'Claimed') {
            return res.status(400).json({ error: "This gift item has already been claimed." });
        }

        const authUser = getOptionalUser(req);
        const requesterEmail = authUser ? authUser.email.toLowerCase() : null;

        // Prevent donor from requesting their own item
        if (requesterEmail && gift.donorEmail && gift.donorEmail.toLowerCase() === requesterEmail) {
            return res.status(400).json({ error: "You cannot request your own gift listing." });
        }

        const canonicalGiftId = gift.id || gift._id?.toString();

        // Prevent duplicate pending request from the same authenticated user
        if (requesterEmail) {
            const existingPending = await requestsCollection.findOne({
                giftId: canonicalGiftId,
                requesterEmail,
                status: 'Pending'
            });
            if (existingPending) {
                return res.status(409).json({
                    error: "You already have a pending request for this item."
                });
            }
        }

        const newRequest = {
            id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            giftId: canonicalGiftId,
            giftName: gift.name,
            giftImage: gift.image,
            giftZipcode: gift.zipcode || '10001',
            donorEmail: gift.donorEmail ? gift.donorEmail.toLowerCase() : null,
            donorName: gift.donorName || 'Community Donor',
            requesterId: authUser ? authUser.id : null,
            requesterEmail,
            requesterName: requesterName.trim().slice(0, 100),
            requesterContact: requesterContact.trim().slice(0, 150),
            message: message.trim().slice(0, 1000),
            status: 'Pending',
            createdAt: new Date().toISOString()
        };

        await requestsCollection.insertOne(newRequest);

        // Update gift status from Available -> Pending
        if (!gift.status || gift.status === 'Available') {
            await giftsCollection.updateOne(
                buildIdQuery(canonicalGiftId),
                { $set: { status: 'Pending', updatedAt: new Date().toISOString() } }
            );
        }

        return res.status(201).json({
            message: "Gift request submitted successfully!",
            request: newRequest,
            giftStatus: gift.status === 'Claimed' ? 'Claimed' : 'Pending'
        });
    } catch (error) {
        console.error("Error submitting gift request:", error);
        return res.status(500).json({ error: "Failed to submit gift request." });
    }
});

/**
 * Route: GET /api/requests/sent
 * Protected Route: Get all requests submitted by the authenticated user
 */
router.get('/sent', authenticateToken, async (req, res) => {
    try {
        const userEmail = req.user.email?.toLowerCase();
        if (!userEmail) {
            return res.status(400).json({ error: "User email missing from token." });
        }

        const db = await connectToDatabase();
        const requestsCollection = db.collection('requests');
        const sentRequests = await requestsCollection
            .find({ requesterEmail: userEmail })
            .sort({ createdAt: -1 })
            .toArray();

        return res.status(200).json(sentRequests);
    } catch (error) {
        console.error("Error fetching sent requests:", error);
        return res.status(500).json({ error: "Failed to load your sent requests." });
    }
});

/**
 * Route: GET /api/requests/received
 * Protected Route: Get all incoming requests for gifts donated by the authenticated user
 */
router.get('/received', authenticateToken, async (req, res) => {
    try {
        const userEmail = req.user.email?.toLowerCase();
        if (!userEmail) {
            return res.status(400).json({ error: "User email missing from token." });
        }

        const db = await connectToDatabase();
        const requestsCollection = db.collection('requests');
        const receivedRequests = await requestsCollection
            .find({ donorEmail: userEmail })
            .sort({ createdAt: -1 })
            .toArray();

        return res.status(200).json(receivedRequests);
    } catch (error) {
        console.error("Error fetching received requests:", error);
        return res.status(500).json({ error: "Failed to load incoming requests." });
    }
});

/**
 * Route: PUT /api/requests/:id/status
 * Protected Route: Donor accepts or rejects an incoming gift request
 */
router.put('/:id/status', authenticateToken, async (req, res) => {
    try {
        const requestId = req.params.id;
        const { status } = req.body;
        const userEmail = req.user.email?.toLowerCase();

        if (!['Accepted', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: "Status must be either 'Accepted' or 'Rejected'." });
        }

        const db = await connectToDatabase();
        const requestsCollection = db.collection('requests');
        const giftsCollection = db.collection('gifts');

        const existingRequest = await requestsCollection.findOne(buildIdQuery(requestId));
        if (!existingRequest) {
            return res.status(404).json({ error: "Request not found." });
        }

        // Only the donor who owns the gift can accept/reject
        if (!existingRequest.donorEmail || existingRequest.donorEmail.toLowerCase() !== userEmail) {
            return res.status(403).json({ error: "Forbidden: Only the item donor can manage this request." });
        }

        const now = new Date().toISOString();

        // Update this request status
        await requestsCollection.updateOne(
            buildIdQuery(requestId),
            { $set: { status, updatedAt: now } }
        );

        let updatedGiftStatus = 'Pending';

        if (status === 'Accepted') {
            // Mark gift as Claimed
            updatedGiftStatus = 'Claimed';
            await giftsCollection.updateOne(
                buildIdQuery(existingRequest.giftId),
                { $set: { status: 'Claimed', claimedBy: existingRequest.requesterName, updatedAt: now } }
            );

            // Auto-reject any other pending requests for the same gift
            await requestsCollection.updateMany(
                {
                    giftId: existingRequest.giftId,
                    status: 'Pending',
                    id: { $ne: existingRequest.id }
                },
                {
                    $set: {
                        status: 'Rejected',
                        note: 'Item has been claimed by another community member.',
                        updatedAt: now
                    }
                }
            );
        } else if (status === 'Rejected') {
            // If no other pending requests remain for this gift, restore status to Available
            const otherPending = await requestsCollection.findOne({
                giftId: existingRequest.giftId,
                status: 'Pending'
            });

            if (!otherPending) {
                const gift = await giftsCollection.findOne(buildIdQuery(existingRequest.giftId));
                if (gift && gift.status !== 'Claimed') {
                    updatedGiftStatus = 'Available';
                    await giftsCollection.updateOne(
                        buildIdQuery(existingRequest.giftId),
                        { $set: { status: 'Available', updatedAt: now } }
                    );
                }
            }
        }

        return res.status(200).json({
            message: `Request ${status.toLowerCase()} successfully.`,
            request: { ...existingRequest, status, updatedAt: now },
            giftStatus: updatedGiftStatus
        });
    } catch (error) {
        console.error(`Error updating request status for ${req.params.id}:`, error);
        return res.status(500).json({ error: "Failed to update request status." });
    }
});

module.exports = router;
