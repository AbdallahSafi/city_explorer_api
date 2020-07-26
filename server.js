'use strict';

// Decalaring varaibles
const express = require('express');
var cors = require('cors');
require('dotenv').config();

// initialize the server
const server = express();
server.use(cors());

// Declare a port
const PORT = process.env.PORT || 3000;

// Test the server
server.listen(PORT, () => {
  console.log('I am listening to port: ', PORT);
});

// localhost:3000/test
server.get('/test/?page=2', (request, response) => {
  let page = request.query.page;
  response.send('You are awesome!', page);
});
