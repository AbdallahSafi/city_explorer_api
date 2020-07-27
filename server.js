"use strict";

// Decalaring varaibles
const express = require("express");
var cors = require("cors");
require("dotenv").config();

// initialize the server
const server = express();

// Use cros
server.use(cors());

// Use super agent
const superagent = require("superagent");

// Declare a port
const PORT = process.env.PORT || 3000;

//API key
const API_KEY = process.env.GEOCODE_API_KEY;

// Test the server
server.listen(PORT, () => {
  console.log("I am listening to port: ", PORT);
});

// localhost:3010/location
server.get("/location", async (request, response) => {
  let city = request.query.city;
  let status = 200;
  response.status(status).send(await getLocation(city));
});

// localhost:3010/weather
server.get("/weather", (request, response) => {
  let status = 200;
  response.status(status).send(getWeather());
});

// handle 500 error
server.all("*", (request, response) => {
  let status = 404;
  response.status(status).send("Not Found");
});

// function to get location data
function getLocation(city) {
  // let data = require('./data/location.json');
  let url = `https://api.locationiq.com/v1/autocomplete.php?key=${API_KEY}&q=${city}`;
  let data = superagent.get(url).then((res) => {
    return new Location(city, res.body);
  });
  return data;
}


// function to get weather data
function getWeather() {
  let weatherData = require("./data/weather.json");
  return weatherData.data.map((e) => {
    return new Weather(e);
  });
}

// constructor function formate the location responed data
function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data[0].display_name;
  this.latitude = data[0].lat;
  this.longitude = data[0].lon;
}

// constructor function formate the weather responed data
function Weather(data) {
  this.forecast = data.weather.description;
  const dateObj = new Date(data.valid_date);
  this.time = dateObj.toDateString();
}
