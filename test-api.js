// Quick API test script
const http = require('http');

// Test HTTP health endpoint
const options = {
  hostname: 'localhost',
  port: 8766,
  path: '/health',
  method: 'GET'
};

console.log('Testing API connection...');

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ API is running!');
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
  });
});

req.on('error', (error) => {
  console.error('❌ API connection failed:', error.message);
});

req.end();
