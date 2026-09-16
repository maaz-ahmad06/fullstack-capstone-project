// models/db.js
require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB connection URL and Database Name
const url = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/giftlinkdb';
let dbInstance = null;
const client = new MongoClient(url, { serverSelectionTimeoutMS: 2000 });

// In-memory fallback storage in case local MongoDB is not running
let inMemoryGifts = [];
try {
    const giftsPath = path.join(__dirname, '../util/gifts.json');
    if (fs.existsSync(giftsPath)) {
        inMemoryGifts = JSON.parse(fs.readFileSync(giftsPath, 'utf8'));
    }
} catch (e) {
    inMemoryGifts = [];
}
let inMemoryUsers = [];

const fallbackDb = {
    collection: (name) => {
        if (name === 'gifts') {
            return {
                find: (query = {}) => ({
                    toArray: async () => {
                        return inMemoryGifts.filter(item => {
                            if (query.category && query.category.$regex) {
                                const reg = new RegExp(query.category.$regex, query.category.$options || 'i');
                                if (!reg.test(item.category)) return false;
                            }
                            if (query.name && query.name.$regex) {
                                const reg = new RegExp(query.name.$regex, query.name.$options || 'i');
                                if (!reg.test(item.name)) return false;
                            }
                            if (query.condition && query.condition.$regex) {
                                const reg = new RegExp(query.condition.$regex, query.condition.$options || 'i');
                                if (!reg.test(item.condition)) return false;
                            }
                            if (query.age_years && query.age_years.$lte !== undefined) {
                                if (parseFloat(item.age_years) > query.age_years.$lte) return false;
                            }
                            return true;
                        });
                    }
                }),
                findOne: async (query) => {
                    return inMemoryGifts.find(item => item.id === query.id || item._id === query.id || item.name === query.name) || null;
                },
                insertOne: async (doc) => {
                    inMemoryGifts.push(doc);
                    return { insertedId: doc.id || Date.now().toString() };
                },
                insertMany: async (docs) => {
                    inMemoryGifts = [...docs];
                    return { insertedCount: docs.length };
                },
                deleteMany: async () => {
                    inMemoryGifts = [];
                    return { deletedCount: 0 };
                },
                updateOne: async (filter, update) => {
                    const item = inMemoryGifts.find(i => i.id === filter.id);
                    if (item) {
                        if (update.$push && update.$push.comments) {
                            item.comments = item.comments || [];
                            item.comments.push(update.$push.comments);
                        }
                        return { matchedCount: 1 };
                    }
                    return { matchedCount: 0 };
                }
            };
        }
        if (name === 'users') {
            return {
                findOne: async (query) => {
                    return inMemoryUsers.find(u => u.email.toLowerCase() === (query.email || '').toLowerCase()) || null;
                },
                insertOne: async (user) => {
                    const newUser = { ...user, _id: Date.now().toString() };
                    inMemoryUsers.push(newUser);
                    return { insertedId: newUser._id };
                },
                updateOne: async (filter, update) => {
                    const user = inMemoryUsers.find(u => u.email.toLowerCase() === (filter.email || '').toLowerCase());
                    if (user) {
                        if (update.$set) {
                            Object.assign(user, update.$set);
                        }
                        return { matchedCount: 1 };
                    }
                    return { matchedCount: 0 };
                }
            };
        }
    }
};

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
        console.warn("MongoDB connection fallback: using resilient in-memory datastore.");
        dbInstance = fallbackDb;
        return dbInstance;
    }
}

module.exports = connectToDatabase;
