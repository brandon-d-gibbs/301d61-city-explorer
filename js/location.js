// // Keep some stuff secret in here
// require('dotenv').config();

// // Is it plugged in?
// const express = require('express');
// const app = express();

// // Fly away and bring things back
// const superagent = require('superagent');

// //Database Stuff
// const pg = require('pg');
// const client = new pg.Client(process.env.DATABASE_URL);

// // Securtiy guard ...sort of.
// const cors = require('cors');
// app.use(cors());



// module.exports = function searchLocation (request, response) {
//     console.log('Hello from moduleville', request.query.city);
//     let city = request.query.city;
//     let key = process.env.GEO_CODE_API;
//     const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
    

//     // Query to search DB
//     let sql = `SELECT * FROM locations WHERE search_query =$1;`;
//     let safeValues = [city];

//     client.query(sql, safeValues)
//         .then(results => {
//             if (results.rows[0]) {
//                 response.send(results.rows[0]);
//             }else {
//                 superagent.get(url)
//                     .then(results => {      
//                     let obj = results.body[0];
//                     console.log('Hellloooo???', obj)
//                     let location = new City(city, obj);
//                     console.log('show the shit')
//                     response.status(200).send(location);
//                     console.log('hello, I need to write some shit down.');
//                     let sql = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);`;
//                     let safeValues = [city, location.formatted_query, location.latitude, location.longitude];

//                     client.query(sql, safeValues);

//                     }).catch(err => {
//                 response.status(500).send(err);
//                 })
//             }
//         })
// }

// client.connect();
// //     .then(() => )
// // .catch(err => {
// //     console.log('Oh, hey... You\'re missing a databse. 0_o', err);
// //     response.status(500).send(err);
// // })

// // exports.searchLocation = searchLocation();