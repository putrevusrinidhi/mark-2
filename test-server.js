const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3002;

// In-memory storage for portfolio items
let portfolioItems = [];
let nextId = 1;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Enhanced test server is working!' });
});

// GET /api/v1/portfolio - Get all portfolio items
app.get('/api/v1/portfolio', (req, res) => {
  console.log(`📊 GET /api/v1/portfolio - Returning ${portfolioItems.length} items`);
  res.json({
    success: true,
    count: portfolioItems.length,
    data: portfolioItems
  });
});

// POST /api/v1/portfolio - Create new portfolio item
app.post('/api/v1/portfolio', (req, res) => {
  console.log('📝 POST /api/v1/portfolio - Received:', req.body);
  
  // Create new item with ID and timestamps
  const newItem = {
    _id: `item_${nextId++}`,
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Save to in-memory store
  portfolioItems.push(newItem);
  
  console.log(`✅ Item saved! Total items: ${portfolioItems.length}`);
  
  res.status(201).json({
    success: true,
    data: newItem
  });
});

// PUT /api/v1/portfolio/:id - Update portfolio item
app.put('/api/v1/portfolio/:id', (req, res) => {
  const { id } = req.params;
  console.log(`✏️  PUT /api/v1/portfolio/${id} - Update with:`, req.body);
  
  const itemIndex = portfolioItems.findIndex(item => item._id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Portfolio item not found'
    });
  }
  
  // Update the item while preserving ID and createdAt
  const updatedItem = {
    ...portfolioItems[itemIndex],
    ...req.body,
    _id: id, // Preserve original ID
    createdAt: portfolioItems[itemIndex].createdAt, // Preserve creation time
    updatedAt: new Date() // Update modification time
  };
  
  portfolioItems[itemIndex] = updatedItem;
  console.log(`✅ Item updated! ID: ${id}`);
  
  res.json({
    success: true,
    data: updatedItem
  });
});

// DELETE /api/v1/portfolio/:id - Delete portfolio item
app.delete('/api/v1/portfolio/:id', (req, res) => {
  const { id } = req.params;
  console.log(`🗑️  DELETE /api/v1/portfolio/${id}`);
  
  const itemIndex = portfolioItems.findIndex(item => item._id === id);
  
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Portfolio item not found'
    });
  }
  
  const deletedItem = portfolioItems.splice(itemIndex, 1)[0];
  console.log(`✅ Item deleted! Total items: ${portfolioItems.length}`);
  
  res.json({
    success: true,
    message: 'Portfolio item deleted successfully',
    data: deletedItem
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Enhanced test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Portfolio API: http://localhost:${PORT}/api/v1/portfolio`);
  console.log(`💾 Using in-memory storage (data will be lost on restart)`);
});
