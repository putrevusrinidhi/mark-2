// Migration script to update MongoDB collection schema validation
const { connectToDatabase, closeConnection, client } = require('./connection');
const { portfolioItemValidation, portfolioItemIndexes } = require('./schema');

async function migrateSchema() {
  try {
    console.log('🚀 Starting schema migration...');
    
    // Connect to database
    await connectToDatabase();
    const db = client.db('portfolioManagement');
    const collectionName = 'portfolioItems';
    
    // Check if collection exists
    const collections = await db.listCollections({ name: collectionName }).toArray();
    
    if (collections.length > 0) {
      console.log('📋 Collection exists. Dropping existing validation...');
      
      // Remove existing validation by updating with empty validation
      await db.command({
        collMod: collectionName,
        validator: {}
      });
      
      console.log('🗑️ Existing validation removed.');
    } else {
      console.log('📋 Collection does not exist. Will be created with validation.');
    }
    
    // Apply new validation
    console.log('🔧 Applying new schema validation...');
    
    try {
      await db.command({
        collMod: collectionName,
        validator: portfolioItemValidation,
        validationLevel: 'strict',
        validationAction: 'error'
      });
      console.log('✅ Schema validation applied successfully.');
    } catch (error) {
      if (error.codeName === 'NamespaceNotFound') {
        // Collection doesn't exist, create it with validation
        await db.createCollection(collectionName, {
          validator: portfolioItemValidation,
          validationLevel: 'strict',
          validationAction: 'error'
        });
        console.log('✅ Collection created with schema validation.');
      } else {
        throw error;
      }
    }
    
    // Create indexes
    console.log('🔍 Creating indexes...');
    const collection = db.collection(collectionName);
    
    for (const index of portfolioItemIndexes) {
      await collection.createIndex(index);
      console.log(`✅ Index created:`, index);
    }
    
    console.log('🎉 Schema migration completed successfully!');
    
    // Test the new schema with a sample document
    console.log('🧪 Testing schema with sample document...');
    
    const testDoc = {
      name: 'Test Asset',
      type: 'stock',
      quantity: 1,
      purchasePrice: 100,
      purchaseDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    try {
      const result = await collection.insertOne(testDoc);
      console.log('✅ Test document inserted successfully:', result.insertedId);
      
      // Clean up test document
      await collection.deleteOne({ _id: result.insertedId });
      console.log('🧹 Test document cleaned up.');
      
    } catch (testError) {
      console.error('❌ Test document failed validation:', testError.message);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await closeConnection();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateSchema()
    .then(() => {
      console.log('Migration completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateSchema };
