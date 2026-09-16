// util/import-mongo.js
require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const url = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/giftlinkdb';
const filename = path.join(__dirname, 'gifts.json');

async function importData() {
    const client = new MongoClient(url);
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB for data import.");
        
        const db = client.db();
        const collection = db.collection('gifts');
        
        // Optional: clear existing records to prevent duplicate insertion
        await collection.deleteMany({});
        
        const rawData = fs.readFileSync(filename, 'utf-8');
        const giftsData = JSON.parse(rawData);
        
        const result = await collection.insertMany(giftsData);
        console.log(`Successfully inserted ${result.insertedCount} documents into collection 'gifts'.`);
        console.log("MongoDB import completed successfully.");
    } catch (err) {
        console.error("Error importing data into MongoDB:", err);
    } finally {
        await client.close();
    }
}

importData();
