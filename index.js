const express = require('express');
const Datastore = require('nedb');
const fetch = require('node-fetch');
require('dotenv').config()

const app = express();
app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));



const database = new Datastore('database.db');
database.loadDatabase();

// GET request sends database info to all.html
app.get('/api', (request, response) => {
    database.find({}).sort({ timestamp: 1 }).exec((err, data) => {
        if (err) {
            response.end();
            return;
        }
        response.json(data);
    });

});

// POST request receives {lat, lon, mood} from index.html, adds timestamp & saves to database
app.post('/api', (request, response) => {
    console.log('I got a request!');
    console.log(request.body);
    const data = request.body;
    const timestamp = Date.now();
    data.timestamp = timestamp;
    database.insert(data);
    response.json(data);
});

// GET request receives lat, lon as parameters & assembles a query to the openweather api
app.get('/weather/:latlon', async (request, response) => {
    console.log(request.params);
    const latlon = request.params.latlon.split(',');
    console.log(latlon);
    const lat = latlon[0];
    const lon = latlon[1];
    console.log(lat, lon);
    const openWeather_apikey = process.env.OPENWEATHER_APIKEY;
    const openWeather_url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeather_apikey}`;
    const weatherResponse = await fetch(openWeather_url);
    const weatherData = await weatherResponse.json();

    const aqResponse = await fetch(`https://api.openaq.org/v1/latest?limit=100&page=1&offset=0&sort=desc&coordinates=${lat}%2C${lon}&radius=50000&order_by=distance&dumpRaw=false`);
    const aqData = await aqResponse.json();
    const data = {
        location: weatherData.name,
        weather: weatherData.weather[0].description,
        temperature: weatherData.main.temp,
        tempLow: weatherData.main.temp_min,
        tempHigh: weatherData.main.temp_max,
        airQuality: aqData,
    };


    response.json(data);
});

