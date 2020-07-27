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
  // if (!city || !isNaN(city)) {
  //   let status = 500;
  //   response
  //     .status(status)
  //     .send({ status: status, responseText: 'Sorry, something went wrong' });
  // } else {
  let status = 200;
  let data = require('./data/location.json');
  let getLocation = new Location(city, data);
  response.status(status).send(getLocation);
  // }
});

let weathers = [];

// localhost:3010/weather
server.get('/weather', (request, response) => {
  let city = request.query.city;
  // if (!city || !isNaN(city)) {
  //   let status = 500;
  //   response
  //     .status(status)
  //     .send({ status: status, responseText: 'Sorry, something went wrong' });
  // } else {
  let status = 200;
  let weatherData = require('./data/weather.json');
  weathers = [];
  weatherData.data.forEach((e) => {
    new Weather(city, e);
  });
  response.status(status).send(weathers);
  // }
});

// handle 500 error
server.all('*', (request, response) => {
  let status = 500;
  response.status(status).send({ 'status': status, 'responseText': 'Not Found' });
});

// constructor function formate the location responed data
function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data[0].display_name;
  this.latitude = data[0].lat;
  this.longitude = data[0].lon;
}

// constructor function formate the weather responed data
function Weather(city, data) {
  this.forecast = data.weather.description;
  const dateObj = new Date(data.valid_date);
  this.time = dateObj.toDateString();
  // Weather.weathers.push(this);
  weathers.push(this);
}
