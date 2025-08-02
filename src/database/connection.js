// MongoDB Connection Setup

require('dotenv').config(); // Load environment variables

const { MongoClient } = require('mongodb');
const { portfolioItemValidation, portfolioItemIndexes } = require('./schema');

// MongoDB URI & DB from .env
const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;
const collectionName = 'portfolioItems';

// Initialize MongoDB client
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    // Connect to MongoDB Atlas
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Apply schema validation and create collection if needed
    await db.command({
      collMod: collectionName,
      validator: portfolioItemValidation,
    }).catch(async (err) => {
      if (err.codeName === 'NamespaceNotFound') {
        await db.createCollection(collectionName, {
          validator: portfolioItemValidation,
        });
        console.log(`🆕 Collection '${collectionName}' created with schema validation`);
      } else {
        console.warn('⚠️ Schema validation skipped:', err.message);
      }
    });

    // Create indexes
    for (const index of portfolioItemIndexes) {
      await collection.createIndex(index);
    }

    console.log('✅ Database setup complete');
  } catch (err) {
    console.error('❌ Error connecting to MongoDB:', err.message);
  }
}

async function closeConnection() {
  await client.close();
}

module.exports = { connectToDatabase, closeConnection, client };

