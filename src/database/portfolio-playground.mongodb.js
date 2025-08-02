/* global use, db */
// MongoDB Playground for Portfolio Management System
// Make sure you are connected to your MongoDB instance

// Select the database to use
use('portfolioManagement');

// Create the portfolioItems collection with schema validation
db.createCollection("portfolioItems", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["stockTicker", "volume"],
      properties: {
        stockTicker: {
          bsonType: "string",
          description: "Stock ticker symbol - required string",
          pattern: "^[A-Z0-9]{1,10}$"
        },
        volume: {
          bsonType: "number",
          minimum: 0,
          description: "Number of shares - required positive number"
        },
        createdAt: {
          bsonType: "date",
          description: "Creation timestamp"
        },
        updatedAt: {
          bsonType: "date", 
          description: "Last update timestamp"
        }
      }
    }
  }
});

// Insert some sample portfolio items
db.getCollection('portfolioItems').insertMany([
  { 
    'stockTicker': 'AAPL', 
    'volume': 100, 
    'createdAt': new Date(),
    'updatedAt': new Date()
  },
  { 
    'stockTicker': 'GOOGL', 
    'volume': 50, 
    'createdAt': new Date(),
    'updatedAt': new Date()
  },
  { 
    'stockTicker': 'MSFT', 
    'volume': 75, 
    'createdAt': new Date(),
    'updatedAt': new Date()
  },
  { 
    'stockTicker': 'TSLA', 
    'volume': 25, 
    'createdAt': new Date(),
    'updatedAt': new Date()
  },
  { 
    'stockTicker': 'AMZN', 
    'volume': 30, 
    'createdAt': new Date(),
    'updatedAt': new Date()
  }
]);

// Create indexes for better performance
db.getCollection('portfolioItems').createIndex({ stockTicker: 1 });
db.getCollection('portfolioItems').createIndex({ createdAt: -1 });
db.getCollection('portfolioItems').createIndex({ stockTicker: 1, volume: -1 });

// Query all portfolio items
console.log("All portfolio items:");
db.getCollection('portfolioItems').find({});

// Find a specific stock
console.log("AAPL holdings:");
db.getCollection('portfolioItems').find({ stockTicker: "AAPL" });

// Calculate total portfolio value (assuming we had prices)
console.log("Portfolio summary:");
db.getCollection('portfolioItems').aggregate([
  {
    $group: {
      _id: null,
      totalHoldings: { $sum: "$volume" },
      uniqueStocks: { $sum: 1 },
      stockList: { $push: "$stockTicker" }
    }
  }
]);

// Find stocks with volume greater than 50
console.log("Large holdings (> 50 shares):");
db.getCollection('portfolioItems').find({ volume: { $gt: 50 } });

// Update a portfolio item (increase AAPL volume)
db.getCollection('portfolioItems').updateOne(
  { stockTicker: "AAPL" },
  { 
    $inc: { volume: 25 },
    $set: { updatedAt: new Date() }
  }
);

// Verify the update
console.log("Updated AAPL holding:");
db.getCollection('portfolioItems').find({ stockTicker: "AAPL" });

// Example of adding a new portfolio item
db.getCollection('portfolioItems').insertOne({
  stockTicker: "NVDA",
  volume: 40,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Get portfolio sorted by volume (largest holdings first)
console.log("Portfolio sorted by holdings:");
db.getCollection('portfolioItems').find({}).sort({ volume: -1 });

// Example aggregation: Group by first letter of stock ticker
console.log("Stocks grouped by first letter:");
db.getCollection('portfolioItems').aggregate([
  {
    $group: {
      _id: { $substr: ["$stockTicker", 0, 1] },
      stocks: { $push: { ticker: "$stockTicker", volume: "$volume" } },
      totalVolume: { $sum: "$volume" }
    }
  },
  { $sort: { _id: 1 } }
]);
