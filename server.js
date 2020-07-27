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

//API key for locations
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;

//API key for weather
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

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
server.get("/weather", async (request, response) => {
  let city = request.query.search_query;
  let status = 200;
  response.status(status).send(await getWeather(city));
});

// handle 500 error
server.all("*", (request, response) => {
  let status = 404;
  response.status(status).send("Not Found");
});

// function to get location data
function getLocation(city) {
  let url = `https://api.locationiq.com/v1/autocomplete.php?key=${GEOCODE_API_KEY}&q=${city}`;
  let data = superagent.get(url).then((res) => {
    return new Location(city, res.body);
  });
  return data;
}

// function to get weather data
function getWeather(city) {
  let url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${WEATHER_API_KEY}&days=5`;
  let data = superagent.get(url).then((res) => {
    return res.body.data.map((e) => {
      return new Weather(e);
    });
  });
  return data;
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
