// models/db.js
require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// MongoDB connection URL and Database Name
const url = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/giftlinkdb';
let dbInstance = null;
const client = new MongoClient(url, { serverSelectionTimeoutMS: 5000 });

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
let inMemoryRequests = [];

function matchesGiftFilter(item, filter) {
    if (filter.id && (item.id === filter.id || item.id === filter.id?.toString())) return true;
    if (filter._id && (item._id === filter._id || item._id === filter._id?.toString() || item.id === filter._id || item.id === filter._id?.toString())) return true;
    if (filter.name && item.name === filter.name) return true;
    if (filter.$or && Array.isArray(filter.$or)) {
        return filter.$or.some(q =>
            (q.id && (item.id === q.id || item.id === q.id?.toString())) ||
            (q._id && (item._id === q._id || item._id === q._id?.toString() || item.id === q._id || item.id === q._id?.toString()))
        );
    }
    return false;
}

const fallbackDb = {
    collection: (name) => {
        if (name === 'gifts') {
            const filterGifts = (query = {}) => {
                return inMemoryGifts.filter(item => {
                    if (query.category && query.category.$regex) {
                        const reg = new RegExp(query.category.$regex, query.category.$options || 'i');
                        if (!reg.test(item.category || '')) return false;
                    }
                    if (query.name && query.name.$regex) {
                        const reg = new RegExp(query.name.$regex, query.name.$options || 'i');
                        if (!reg.test(item.name || '')) return false;
                    }
                    if (query.condition && query.condition.$regex) {
                        const reg = new RegExp(query.condition.$regex, query.condition.$options || 'i');
                        if (!reg.test(item.condition || '')) return false;
                    }
                    if (query.age_years && query.age_years.$lte !== undefined) {
                        if (parseFloat(item.age_years) > query.age_years.$lte) return false;
                    }
                    if (query.zipcode && item.zipcode !== query.zipcode) {
                        return false;
                    }
                    if (query.donorEmail) {
                        if ((item.donorEmail || '').toLowerCase() !== query.donorEmail.toLowerCase()) return false;
                    }
                    if (query.$or && Array.isArray(query.$or)) {
                        const matchedOr = query.$or.some(cond => {
                            return Object.entries(cond).every(([field, val]) => {
                                if (val && val.$regex) {
                                    const reg = new RegExp(val.$regex, val.$options || 'i');
                                    return reg.test(item[field] || '');
                                }
                                return item[field] === val;
                            });
                        });
                        if (!matchedOr) return false;
                    }
                    return true;
                });
            };

            return {
                countDocuments: async (query = {}) => {
                    return filterGifts(query).length;
                },
                find: (query = {}) => {
                    let sortSpec = null;
                    let skipCount = 0;
                    let limitCount = null;

                    const cursor = {
                        sort: (spec) => {
                            sortSpec = spec;
                            return cursor;
                        },
                        skip: (n) => {
                            skipCount = Math.max(0, Number(n) || 0);
                            return cursor;
                        },
                        limit: (n) => {
                            limitCount = Math.max(0, Number(n) || 0);
                            return cursor;
                        },
                        toArray: async () => {
                            let results = [...filterGifts(query)];
                            if (sortSpec && typeof sortSpec === 'object') {
                                const [field, dir] = Object.entries(sortSpec)[0] || [];
                                if (field) {
                                    results.sort((a, b) => {
                                        const valA = a[field] ?? '';
                                        const valB = b[field] ?? '';
                                        if (typeof valA === 'string' || typeof valB === 'string') {
                                            return dir === -1
                                                ? String(valB).localeCompare(String(valA))
                                                : String(valA).localeCompare(String(valB));
                                        }
                                        return dir === -1 ? (valB - valA) : (valA - valB);
                                    });
                                }
                            }
                            if (skipCount > 0) {
                                results = results.slice(skipCount);
                            }
                            if (limitCount !== null) {
                                results = results.slice(0, limitCount);
                            }
                            return results;
                        }
                    };
                    return cursor;
                },
                findOne: async (query) => {
                    return inMemoryGifts.find(item => matchesGiftFilter(item, query)) || null;
                },
                insertOne: async (doc) => {
                    inMemoryGifts.unshift(doc);
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
                deleteOne: async (filter) => {
                    const idx = inMemoryGifts.findIndex(i => matchesGiftFilter(i, filter));
                    if (idx !== -1) {
                        inMemoryGifts.splice(idx, 1);
                        return { deletedCount: 1 };
                    }
                    return { deletedCount: 0 };
                },
                updateOne: async (filter, update) => {
                    const item = inMemoryGifts.find(i => matchesGiftFilter(i, filter));
                    if (item) {
                        if (update.$set) {
                            Object.assign(item, update.$set);
                        }
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
        if (name === 'requests') {
            const matchesComplexReq = (item, query = {}) => {
                for (const [key, val] of Object.entries(query)) {
                    if (key === '$or' && Array.isArray(val)) {
                        const matchedOr = val.some(q =>
                            (q.id && (item.id === q.id || item.id === q.id?.toString())) ||
                            (q._id && (item._id === q._id || item._id === q._id?.toString() || item.id === q._id || item.id === q._id?.toString()))
                        );
                        if (!matchedOr) return false;
                    } else if (val && typeof val === 'object' && '$ne' in val) {
                        if (item[key] === val.$ne || item[key]?.toString() === val.$ne?.toString()) return false;
                    } else if (key === 'donorEmail' || key === 'requesterEmail') {
                        if ((item[key] || '').toLowerCase() !== (val || '').toLowerCase()) return false;
                    } else {
                        if (item[key] !== val && item[key]?.toString() !== val?.toString()) return false;
                    }
                }
                return true;
            };
            return {
                find: (query = {}) => ({
                    sort: () => ({
                        toArray: async () => inMemoryRequests.filter(item => matchesComplexReq(item, query))
                    }),
                    toArray: async () => inMemoryRequests.filter(item => matchesComplexReq(item, query))
                }),
                findOne: async (query) => {
                    return inMemoryRequests.find(item => matchesComplexReq(item, query)) || null;
                },
                insertOne: async (doc) => {
                    const newReq = { ...doc, _id: doc.id || Date.now().toString() };
                    inMemoryRequests.unshift(newReq);
                    return { insertedId: newReq._id };
                },
                updateOne: async (filter, update) => {
                    const reqItem = inMemoryRequests.find(item => matchesComplexReq(item, filter));
                    if (reqItem) {
                        if (update.$set) {
                            Object.assign(reqItem, update.$set);
                        }
                        return { matchedCount: 1, modifiedCount: 1 };
                    }
                    return { matchedCount: 0, modifiedCount: 0 };
                },
                updateMany: async (filter, update) => {
                    let count = 0;
                    inMemoryRequests.forEach(item => {
                        if (matchesComplexReq(item, filter)) {
                            if (update.$set) {
                                Object.assign(item, update.$set);
                            }
                            count++;
                        }
                    });
                    return { matchedCount: count, modifiedCount: count };
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
