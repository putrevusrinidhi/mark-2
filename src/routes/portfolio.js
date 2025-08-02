// Portfolio API Routes
const express = require('express');
const { ObjectId } = require('mongodb');
const Joi = require('joi');
const { client } = require('../database/connection');

const router = express.Router();
const dbName = process.env.MONGODB_DB_NAME || 'portfolioManagement';
const collectionName = 'portfolioItems';

// Temporary in-memory storage for demo purposes
let portfolioData = [
  {
    _id: new ObjectId(),
    name: 'Apple Inc (AAPL)',
    type: 'stock',
    quantity: 100,
    purchasePrice: 150.25,
    purchaseDate: new Date('2024-01-15'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: 'Microsoft Corporation (MSFT)',
    type: 'stock',
    quantity: 50,
    purchasePrice: 375.80,
    purchaseDate: new Date('2024-02-10'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: 'Tesla Inc (TSLA)',
    type: 'stock',
    quantity: 25,
    purchasePrice: 220.15,
    purchaseDate: new Date('2024-03-05'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: 'Vanguard S&P 500 ETF',
    type: 'etf',
    quantity: 200,
    purchasePrice: 425.50,
    purchaseDate: new Date('2024-01-20'),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: new ObjectId(),
    name: 'Bitcoin',
    type: 'crypto',
    quantity: 0.5,
    purchasePrice: 45000.00,
    purchaseDate: new Date('2024-02-15'),
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Validation schema for portfolio items
const portfolioItemSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  type: Joi.string().valid('stock', 'bond', 'crypto', 'mutual_fund', 'etf', 'real_estate', 'commodity').required(),
  quantity: Joi.number().min(0).required(),
  purchasePrice: Joi.number().min(0).required(),
  purchaseDate: Joi.date().required()
});

// GET /api/v1/portfolio - Get all portfolio items
router.get('/', async (req, res) => {
  try {
    // Use in-memory data for demo
    const portfolioItems = [...portfolioData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      count: portfolioItems.length,
      data: portfolioItems
    });
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio items'
    });
  }
});

// GET /api/v1/portfolio/:id - Get specific portfolio item
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid portfolio item ID'
      });
    }
    
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    const portfolioItem = await collection.findOne({ _id: new ObjectId(id) });
    
    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio item not found'
      });
    }
    
    res.json({
      success: true,
      data: portfolioItem
    });
  } catch (error) {
    console.error('Error fetching portfolio item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio item'
    });
  }
});

// POST /api/v1/portfolio - Create new portfolio item
router.post('/', async (req, res) => {
  try {
    console.log('📦 Received payload:', req.body);
    
    // Validate request body
    const { error, value } = portfolioItemSchema.validate(req.body);
    if (error) {
      console.log('❌ Joi validation failed:', error.details[0].message);
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    console.log('✅ Joi validation passed. Clean data:', value);
    
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Note: Allow duplicate names as users might have multiple positions
    
    // Create new portfolio item with explicit type conversion
    const newItem = {
      name: String(value.name).trim(),
      type: String(value.type),
      quantity: Number(value.quantity),
      purchasePrice: Number(value.purchasePrice),
      purchaseDate: new Date(value.purchaseDate),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('💾 Final item to insert with correct types:', newItem);
    console.log('📊 Type check:');
    console.log('  - name:', typeof newItem.name, '→', newItem.name);
    console.log('  - type:', typeof newItem.type, '→', newItem.type);
    console.log('  - quantity:', typeof newItem.quantity, '→', newItem.quantity);
    console.log('  - purchasePrice:', typeof newItem.purchasePrice, '→', newItem.purchasePrice);
    console.log('  - purchaseDate:', typeof newItem.purchaseDate, '→', newItem.purchaseDate);
    
    const result = await collection.insertOne(newItem);
    const createdItem = await collection.findOne({ _id: result.insertedId });
    
    res.status(201).json({
      success: true,
      data: createdItem
    });
  } catch (error) {
    console.error('Error creating portfolio item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create portfolio item'
    });
  }
});

// PUT /api/v1/portfolio/:id - Update portfolio item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid portfolio item ID'
      });
    }
    
    // Validate request body
    const { error, value } = portfolioItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Check if item exists
    const existingItem = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio item not found'
      });
    }
    
    // Update the item
    const updateData = {
      ...value,
      updatedAt: new Date()
    };
    
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    const updatedItem = await collection.findOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    console.error('Error updating portfolio item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update portfolio item'
    });
  }
});

// DELETE /api/v1/portfolio/:id - Delete portfolio item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid portfolio item ID'
      });
    }
    
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    // Check if item exists
    const existingItem = await collection.findOne({ _id: new ObjectId(id) });
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio item not found'
      });
    }
    
    // Delete the item
    await collection.deleteOne({ _id: new ObjectId(id) });
    
    res.json({
      success: true,
      message: 'Portfolio item deleted successfully',
      data: existingItem
    });
  } catch (error) {
    console.error('Error deleting portfolio item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete portfolio item'
    });
  }
});

// GET /api/v1/portfolio/stats/summary - Get portfolio summary
router.get('/stats/summary', async (req, res) => {
  try {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    
    const summary = await collection.aggregate([
      {
        $group: {
          _id: null,
          totalHoldings: { $sum: "$volume" },
          uniqueStocks: { $sum: 1 },
          stockList: { $push: "$stockTicker" },
          averageHolding: { $avg: "$volume" }
        }
      }
    ]).toArray();
    
    const result = summary[0] || {
      totalHoldings: 0,
      uniqueStocks: 0,
      stockList: [],
      averageHolding: 0
    };
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio summary'
    });
  }
});

module.exports = router;
