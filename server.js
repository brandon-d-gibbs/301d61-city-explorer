'use strict'

// **** Dependencies ****

// Keep some stuff secret in here
require('dotenv').config();

// Is it plugged in?
const express = require('express');
const app = express();

// Fly away and bring things back
const superagent = require('superagent');

//Database Stuff
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);

// Securtiy guard ...sort of.
const cors = require('cors');
app.use(cors());

//Establish the PORT
const PORT= process.env.PORT || 3005;



// // require('./js/location');
// const searchLocation = require('./js/location.js'); 
// Tried to get this to work. After talking with Jacob, he said this should be a stretch goal.

// **** Routes ****
app.get('/location', searchLocation);
app.get('/weather', getWeather);
app.get('/trails', getTrails);
app.get('/movies', getMovies);
app.get('/yelp', handleYelp);

// **** Callback Functions ****

// Get location data
function searchLocation (request, response) {    
    let city = request.query.city;
    let key = process.env.GEO_CODE_API;
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;    

    // Query to search DB
    let sql = `SELECT * FROM locations WHERE search_query =$1;`;
    let safeValues = [city];

    client.query(sql, safeValues)
        .then(results => {
            if (results.rows[0]) {
                response.send(results.rows[0]);
            }else {
                superagent.get(url)
                    .then(results => {      
                    let obj = results.body[0];
                    let location = new City(city, obj);

                    response.status(200).send(location);
                    
                    let sql = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);`;
                    let safeValues = [city, location.formatted_query, location.latitude, location.longitude];

                    client.query(sql, safeValues);

                    }).catch(err => {
                    response.status(500).send(err);
                })
            }
        })
}

// Get weather data
function getWeather (request, response) {  
    let {search_query, formatted_query, latitude, longitude} = request.query;
    let key = process.env.WEATHER_API_KEY;   
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${key}&days=7`;

    superagent.get(url)
        .then((results) => { 
            const weatherArray = results.body.data; 
            let newWeatherArray = weatherArray.map((day) => new Weather(day));
            response.status(200).send(newWeatherArray);
    }).catch(err => {
        response.status(500).send(err);
        })
}

// Get trail data
function getTrails (request, response) {
    let {latitude, longitude} = request.query;
    let key = process.env.TRAILS_API_KEY;
    let url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&maxDistance=10&key=${key}`;
    
    superagent.get(url)
        .then(results => {
            let trails = results.body.trails;
            const trailsArr = trails.map(trail => new Trail(trail));
            response.status(200).send(trailsArr);
        }).catch(err => {
            response.status(500).send(err);
        })
}

// Get movie data
function getMovies (request, response) {
    let city = request.query.search_query;
    let key = process.env.MOVIE_API_KEY;
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${city}`;
   
    superagent.get(url)
        .then(movieResults => {   
            let movie = movieResults.body.results;          
            let mustSee = movie.map(obj => new Movie(obj));
          
            response.status(200).send(mustSee);
        }).catch(err => {
            response.status(500).send(err);
        })
    }
        
// Get Yelp data     
function handleYelp(request, response){
    let city = request.query.city;
    let url = `https://api.yelp.com/v3/businesses/search?location=${city}&term=restaurants`;
  
    superagent.get(url)
      .set({
          "Authorization": `Bearer ${process.env.YELP_API_KEY}`
        })
      .then(results => {        
        let review = results.body.businesses.map(obj => new Yelp(obj));
        response.status(200).send(review);
    })
  }

// Error handling. 
function handleErrors(error, request, response) {
    response.status(500).send('I\'m not feeling so well.');
}

// **** Constructor Functions ****

function City(city, obj){
    this.search_query = city;
    this.formatted_query = obj.display_name;
    this.latitude = obj.lat;
    this.longitude = obj.lon;
}

function Weather(day) {
    this.time = new Date(day.datetime).toDateString();
    this.forecast = day.weather.description;
}

function Trail(obj) {
    this.name = obj.name;
    this.location = obj.length;
    this.length = obj.length;
    this.stars = obj.stars;
    this.star_votes = obj.starvotes;
    this.summary = obj.summary;
    this.trail_url = obj.url;
    this.conditions = obj.conditionStatus;
    this.condition_date = obj.conditionDate.slice(0,10);
    this.condition_time = obj.conditionDate.slice(11,19);
}

function Movie(obj) {
    this.title = obj.title;
    this.overview = obj.overview;
    this.average_votes = obj.vote_average;
    this.total_votes = obj.vote_count;
    this.image_url = `https://image.tmdb.org/t/p/w500${obj.poster_path}`;
    this.popularity = obj.popularity;
    this.released_on = obj.released_on;
}

function Yelp(obj){
    this.name = obj.name;
    this.image_url = obj.image_url;
    this.price = obj.price;
    this.rating = obj.rating;
    this.url = obj.url;
}

// **** Is it turned on? ****
client.connect()
    .then(() =>{
    app.listen(PORT, () => {
        console.log(`Hey, hey, hey. This app is coming to you live from ${PORT}. Thank you for choosing us as your prefered method of travel. :P`);
    })
}).catch(err => {
    console.log('Oh, hey... You\'re missing a databse. 0_o', err);
    response.status(500).send(err);
})