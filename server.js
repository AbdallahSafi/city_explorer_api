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

// localhost:3010/location
server.get('/location', (request, response) => {
  let city = request.query.city;
  let status = 200;
  let data = require('./data/location.json');
  let getLocation = new Location(city, data);
  response.status(status).send(getLocation);
});

function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data[0].display_name;
  this.latitude = data[0].lat;
  this.longitude = data[0].lon;
}
