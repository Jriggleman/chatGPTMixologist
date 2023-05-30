const express = require('express');
const app = express();
const routes = require('.\\routes\\openai.js');

// Middleware
app.use(express.static('public'));
app.use('/', routes);

// Start the server
app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
