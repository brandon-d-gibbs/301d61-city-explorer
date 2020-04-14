'use strict'

//dependencies
require('dotenv').config();
const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

//Establish the PORT
const PORT= process.env.PORT || 3005;



// Routes
app.get('/location', searchLocation);


// Callback Functions
function searchLocation (request, response) {
    let city = request.query.city;
    console.log('searchData', request.query.city);
    let geoData = require('./data/geo.json');

    let location = new City(city, geoData[0]);

    response.status(200).send(location);
    console.log('locationData', location);
}


// Constructor Functions

function City(city, obj){
    this.search_query = city;
    this.formatted_query = obj.display_name;
    this.latitude = obj.lat;
    this.longitude = obj.lon;
}




// Directing to a Port
app.listen(PORT, () => {
    console.log(`Hey, hey, hey. This app is coming to you live from ${PORT}`);
})