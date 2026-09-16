// models/db.js
require('dotenv').config();
const { MongoClient } = require('mongodb');

// MongoDB connection URL and Database Name
const url = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/giftlinkdb';
let dbInstance = null;
const client = new MongoClient(url);

/**
 * Connect to MongoDB and return database instance
 * Task 4 requirement: await client.connect()
 */
async function connectToDatabase() {
    if (dbInstance) {
        return dbInstance;
    }

    try {
        // Connect the client to the server
        await client.connect();
        console.log("Successfully connected to MongoDB server for GiftLink database");
        dbInstance = client.db();
        return dbInstance;
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        throw error;
    }
}

module.exports = connectToDatabase;
