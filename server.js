'use strict'

//dependencies
require('dotenv').config();
const express = require('express');
const app = express();
const superagent = require('superagent');

const cors = require('cors');
app.use(cors());

//Establish the PORT
const PORT= process.env.PORT || 3005;

// Routes
app.get('/location', searchLocation);
app.get('/weather', getWeather);
app.get('/trails', getTrails);


// Callback Functions
function searchLocation (request, response) {
    
    let city = request.query.city;
    let key = process.env.GEO_CODE_API;
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
    console.log('city', city)

    superagent.get(url)
        .then(results => {
            let searchCity = results.body[0];
            // console.log('searchCity', searchCity);
            let location = new City(city, searchCity);

            response.status(200).send(location);
         }).catch(err => {
            console.log('No trails for you!', err);
            response.status(500).send(err);
            })
}

function getWeather (request, response) {    
   
    let {search_query, formatted_query, latitude, longitude} = request.query;
    console.log('In the clouds', request.query);
    let key = process.env.WEATHER_API;
    console.log(key);
    console.log(latitude, longitude);
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${key}&days=7`;
    
    console.log('gimme my damn link info', url);   

    superagent.get(url)
        .then((results) => { 
            console.log('I made it!!') ;  
            const weatherArray = results.body.data; 
            console.log('Hello, from the clouds', results.body.data)
            let newWeatherArray = weatherArray.map((day) => {
            return new Weather(day);       
            });
            response.status(200).send(newWeatherArray);
    }).catch(err => {
        console.log('No weather there. Weid, right?', err);
        response.status(500).send(err);
        })
}

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
            console.log('No trails for you!', err);
            response.status(500).send(err);
        })

}
// Constructor Functions

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

// Directing to a Port
app.listen(PORT, () => {
    console.log(`Hey, hey, hey. This app is coming to you live from ${PORT}. Thank you for choosing us as your prefered method of travel. :P`);
})