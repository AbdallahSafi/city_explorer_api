"use strict";

// Decalaring varaibles
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pg = require("pg");

//create connection to database
var db = new pg.Client(process.env.DATABASE_URL);

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

//API key for hiking
const TRAIL_API_KEY = process.env.TRAIL_API_KEY;

// Test the server and connect to database
db.connect().then(() => {
  server.listen(PORT, () => {
    console.log("I am listening to port: ", PORT);
  });
});

// localhost:3010/location?city = gaza
server.get("/location", async (request, response) => {
  let city = request.query.city;
  let status = 200;
  let dataRetrived = await getLocationDB(city);
  if (dataRetrived.length === 0) {
    await getLocation(city).then((data) => {
      saveToDB(data);
      response.status(status).send(data);
    });
  } else {
    delete dataRetrived[0].id;
    response.status(status).send(dataRetrived[0]);
  }
});

// localhost:3010/weather?search_query=gaza
server.get("/weather", async (request, response) => {
  let city = request.query.search_query;
  let status = 200;
  response.status(status).send(await getWeather(city));
});

// localhost:3010/trails
server.get("/trails", async (request, response) => {
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  let status = 200;
  response.status(status).send(await getTrails(lat, lon));
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

// function to get weather data
function getTrails(lat, lon) {
  let url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=1000&key=${TRAIL_API_KEY}`;
  let data = superagent
    .get(url)
    .then((res) => {
      return res.body.trails.map((e) => {
        return new Trails(e);
      });
    })
    .catch((e) => {
      console.log(e);
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

// constructor function formate the location responed data
function Trails(data) {
  this.name = data.name;
  this.location = data.location;
  this.lenght = data.length;
  this.stars = data.stars;
  this.star_votes = data.starVotes;
  this.summary = data.summary;
  this.trail_url = data.url;
  this.conditions = data.conditionDetails;
  let day = new Date(data.conditionDate);
  this.condition_date = day.toLocaleDateString();
  this.condition_time = day.toLocaleTimeString("en-US");
}

// function to check the database for exist value
function getLocationDB(city) {
  let sql = `SELECT * FROM location WHERE search_query=$1;`;
  let values = [city];
  return db.query(sql, values).then((result) => {
    return result.rows;
  });
}

function saveToDB(data) {
  console.log("before saving", data);
  let sql = `INSERT INTO location (search_query,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4)`;
  let values = [
    data.search_query,
    data.formatted_query,
    data.latitude,
    data.longitude,
  ];
  db.query(sql, values).then((result) => {
    console.log("saved", result.rows);
  });
}
// server.get("/student", (req, res) => {
//   let sql = "SELECT * FROM students";
//   db.query(SQL).then((result) => {
//     res.status(200).send(result.rows);
//   });
// });

// server.get("/addStudent", (req, res) => {
//   let first_name = req.query.fname;
//   let address = req.query.address;
//   let sql = `INSERT INTO student (first_name, student_address) VALUES ($1,$2)`;
//   let values = [first_name, address];
//   db.query(SQL, values).then((result) => {
//     res.status(200).json(result.rows);
//   });
// });
// INSERT INTO location(search_query,formatted_query,latitude,longitude) VALUES('Gaza','formatted_query', 24, 33);
