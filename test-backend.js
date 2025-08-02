const http = require('http');

console.log('Testing backend API...');

// Test health endpoint
const healthReq = http.request({
  hostname: 'localhost',
  port: 4000,
  path: '/health',
  method: 'GET',
  timeout: 5000
}, (res) => {
  console.log('Health check response:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Health data:', data);
    
    // Test portfolio endpoint
    const portfolioReq = http.request({
      hostname: 'localhost',
      port: 4000,
      path: '/api/v1/portfolio',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      console.log('Portfolio response:', res.statusCode);
      let portfolioData = '';
      res.on('data', (chunk) => portfolioData += chunk);
      res.on('end', () => {
        console.log('Portfolio data:', portfolioData);
        process.exit(0);
      });
    });
    
    portfolioReq.on('error', (err) => {
      console.error('Portfolio request error:', err.message);
      process.exit(1);
    });
    
    portfolioReq.end();
  });
});

healthReq.on('error', (err) => {
  console.error('Health request error:', err.message);
  process.exit(1);
});

healthReq.on('timeout', () => {
  console.error('Health request timeout');
  healthReq.destroy();
  process.exit(1);
});

healthReq.end();
