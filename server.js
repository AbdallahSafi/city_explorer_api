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

//API key for Movies
const MOVIE_API_KEY = process.env.MOVIE_API_KEY;

//API key for yelp
const YELP_API_KEY = process.env.YELP_API_KEY;

// Test the server and connect to database
db.connect().then(() => {
  server.listen(PORT, () => {
    console.log("I am listening to port: ", PORT);
  });
});

// ------------------------ Routes handling --------------------

// location
server.get("/location", async (request, response) => {
  let city = request.query.city;
  let status = 200;
  let dataRetrived = await getLocationDB(city);
  if (dataRetrived.length === 0) {
    await getLocation(city).then((data) => {
      saveLocationToDB(data).then((savedData) => {
        response.status(status).send(savedData);
      });
    });
  } else {
    delete dataRetrived[0].id;
    response.status(status).send(dataRetrived[0]);
  }
});

// weather
server.get("/weather", async (request, response) => {
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  let status = 200;
  response.status(status).send(await getWeather(lat, lon));
});

// trails
server.get("/trails", async (request, response) => {
  let lat = request.query.latitude;
  let lon = request.query.longitude;
  let status = 200;
  response.status(status).send(await getTrails(lat, lon));
});

// movies
server.get("/movies", async (request, response) => {
  let region = request.query.region;
  let status = 200;
  response.status(status).send(await getMovies(region));
});


// handle 500 error
server.all("*", (request, response) => {
  let status = 404;
  response.status(status).send("Not Found");
});
// --------------------- Location functions ---------------------
// function to get location data
function getLocation(city) {
  let url = `https://api.locationiq.com/v1/autocomplete.php?key=${GEOCODE_API_KEY}&q=${city}`;
  let data = superagent.get(url).then((res) => {
    return new Location(city, res.body);
  });
  return data;
}

// function to check the database for exist value
function getLocationDB(city) {
  let sql = `SELECT * FROM location WHERE search_query=$1;`;
  let values = [city];
  return db.query(sql, values).then((result) => {
    return result.rows;
  });
}

// Save location data to database
function saveLocationToDB(data) {
  console.log('save', data);
  let sql = `INSERT INTO location (search_query,formatted_query,latitude,longitude,region) VALUES ($1,$2,$3,$4,$5)`;
  let values = [
    data.search_query,
    data.formatted_query,
    data.latitude,
    data.longitude,
    data.region
  ];
  return db
    .query(sql, values)
    .then((result) => {
      return data;
    })
    .catch((error) => {
      console.log('error', error);
    });
}

// --------------------- Weather functions ---------------------

// function to get weather data
function getWeather(lat, lon) {
  let url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${WEATHER_API_KEY}&days=5`;
  let data = superagent.get(url).then((res) => {
    return res.body.data.map((e) => {
      return new Weather(e);
    });
  });
  return data;
}

// --------------------- Trails functions ---------------------

// function to get Trails data
function getTrails(lat, lon) {
  let url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=1000&key=${TRAIL_API_KEY}`;
  let data = superagent
    .get(url)
    .then((res) => {
      return res.body.trails.map((e) => {
        return new Trails(e);
      });
    })
    .catch((error) => {
      console.log(error);
    });
  return data;
}

// --------------------- Movies functions ---------------------

// function to get movies data
function getMovies(region) {
  let url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${MOVIE_API_KEY}&language=en-US&page=1&region=${region}`;
  let data = superagent
    .get(url)
    .then((res) => {
      return res.body.results.map((e) => {
        return new Movies(e);
      });
    })
    .catch((error) => {
      console.log(error);
    });
  return data;
}


// constructor function formate the location responed data
function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data[0].display_name;
  this.latitude = data[0].lat;
  this.longitude = data[0].lon;
  this.region = data[0].address.country_code.toUpperCase();
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

// constructor function formate the location responed data
function Movies(data) {
  this.title = data.title;
  this.overview = data.overview;
  this.average_votes = data.vote_average;
  this.total_votes = data.vote_count;
  this.image_url = `https://image.tmdb.org/t/p/w500${data.poster_path}`;
  this.popularity = data.popularity;
  this.released_on = data.release_date;
}




