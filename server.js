'use strict'

//dependencies
require('dotenv').config();
const express = require('express');
const app = express();



//Establish the PORT
const PORT= process.env.PORT || 3005;



// Routes



// Callback Functions



// Directing to a Port
app.listen(PORT, () => {
    console.log(`Hey, hey, hey. This app is coming to you live from ${PORT}`);
})