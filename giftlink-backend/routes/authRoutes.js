// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectToDatabase = require('../models/db');

const JWT_SECRET = process.env.JWT_SECRET || 'giftlink_jwt_super_secret_key_2026';

/**
 * Task 11 requirement: APIs for registration, login, and updating user information
 */

/**
 * 1. User Registration API
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: "All fields (firstName, lastName, email, password) are required." });
        }

        const db = await connectToDatabase();
        const collection = db.collection('users');

        // Check if user already exists
        const existingUser = await collection.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists with this email address." });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: hashedPassword,
            createdAt: new Date().toISOString()
        };

        const result = await collection.insertOne(newUser);

        // Generate JWT token
        const authtoken = jwt.sign(
            { id: result.insertedId, email: newUser.email, firstName: newUser.firstName },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(201).json({
            message: "User registered successfully",
            authtoken,
            email: newUser.email,
            userName: `${newUser.firstName} ${newUser.lastName}`
        });
    } catch (error) {
        console.error("Error during user registration:", error);
        return res.status(500).json({ error: "Registration failed due to server error." });
    }
});

/**
 * 2. User Login API
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }

        const db = await connectToDatabase();
        const collection = db.collection('users');

        // Find user by email
        const user = await collection.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ error: "Invalid credentials: User not found." });
        }

        // Compare password hash
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials: Password incorrect." });
        }

        // Generate JWT token
        const authtoken = jwt.sign(
            { id: user._id, email: user.email, firstName: user.firstName },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            message: "Login successful",
            authtoken,
            email: user.email,
            userName: `${user.firstName} ${user.lastName}`
        });
    } catch (error) {
        console.error("Error during user login:", error);
        return res.status(500).json({ error: "Login failed due to server error." });
    }
});

/**
 * 3. Update User Information API
 * PUT /api/auth/update
 */
router.put('/update', async (req, res) => {
    try {
        // Extract Authorization header or body email
        const authHeader = req.headers['authorization'];
        let userEmail = req.body.email;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                userEmail = decoded.email || userEmail;
            } catch (err) {
                return res.status(403).json({ error: "Invalid or expired token." });
            }
        }

        if (!userEmail) {
            return res.status(400).json({ error: "User email or valid Authorization token is required." });
        }

        const { firstName, lastName, address } = req.body;
        const updateFields = {};
        if (firstName) updateFields.firstName = firstName;
        if (lastName) updateFields.lastName = lastName;
        if (address) updateFields.address = address;
        updateFields.updatedAt = new Date().toISOString();

        const db = await connectToDatabase();
        const collection = db.collection('users');

        const result = await collection.updateOne(
            { email: userEmail.toLowerCase() },
            { $set: updateFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "User not found to update." });
        }

        return res.status(200).json({
            message: "User details updated successfully",
            updatedFields: updateFields
        });
    } catch (error) {
        console.error("Error updating user information:", error);
        return res.status(500).json({ error: "Failed to update user profile." });
    }
});

module.exports = router;
