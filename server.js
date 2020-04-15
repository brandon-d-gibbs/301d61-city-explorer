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


// Callback Functions
function searchLocation (request, response) {
    try{
    let city = request.query.city;
    let key = process.env.GEO_CODE_API;
    const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
    console.log('city', city)
    superagent.get(url)
        .then(results => {
            let searchCity = results.body[0];
            console.log('searchCity', results.body[0]);
            let location = new City(searchCity, city);

            // console.log('searchData', request.query.city);
            // let geoData = require('./data/geo.json');    
            // let location = new City(city, geoData[0]);    
            console.log('locationData', location);

            response.status(200).send(location);
         })
    }
    catch(err){
        response.status(500).send(err);
        console.log('Sorry, we messed some stuff up.');
    }
}
    

function getWeather (request, response) {    
    try {
    console.log('In the clouds');
    let weather = require('./data/darksky.json');
    let weatherArray = weather.daily.data;
    console.log('test weather', weather.daily.data);
    let newWeatherArray = weatherArray.map((day) => {
       return new Weather(day);       
    });
    // weather.daily.data.forEach((day) => {
    //     weatherArray.push(new Weather(day));
    //     console.log('weaterArray', weatherArray);
    // })
    response.status(200).send(newWeatherArray);
    }catch(err){
        response.status(500).send(err);
        console.log('Whoospie! There is no weather where you live.');
    }
}

// Constructor Functions

function City(city, obj){
    this.search_query = city;
    this.formatted_query = obj.display_name;
    this.latitude = obj.lat;
    this.longitude = obj.lon;
}

function Weather(day) {
    this.forecast = day.summary;
    this.time = new Date(day.time).toDateString();
}

// Directing to a Port
app.listen(PORT, () => {
    console.log(`Hey, hey, hey. This app is coming to you live from ${PORT}. Thank you for choosing us as your prefered method of travel. :P`);
})