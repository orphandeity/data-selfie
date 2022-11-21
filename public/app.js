// declare variables for location coordinates to be stored in
let lat, lon, locationName, weather, airQuality, mood;
// check for geolocation availability & render coordinates to DOM
console.log('looking for location...');
if ('geolocation' in navigator) {
    console.log('geolocation is available');
    navigator.geolocation.getCurrentPosition(async position => {
        
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        console.log('location found!')
        // document.getElementById('latitude').textContent = lat.toFixed(2);
        // document.getElementById('longitude').textContent = lon.toFixed(2);
        const weather_url = `weather/${lat},${lon}`;
        const response = await fetch(weather_url);
        const json = await response.json();
        console.log(json);

        L.marker([lat, lon], {icon: myIcon}).addTo(map);

        locationName = json.location;
        weather = json.weather;
        const temperatureK = json.temperature;
        const tempHighK = json.tempHigh;
        const tempLowK = json.tempLow;
    
        temperature = (temperatureK - 273.15) * 9 / 5 + 32;
        tempHigh = (tempHighK - 273.15) * 9 / 5 + 32;
        tempLow = (tempLowK - 273.15) * 9 / 5 + 32;

        document.getElementById('location').textContent = locationName;
        document.getElementById('weather').textContent = weather;
        document.getElementById('temperature').textContent = temperature.toFixed(0);
        document.getElementById('tempHigh').textContent = tempHigh.toFixed(0);
        document.getElementById('tempLow').textContent = tempLow.toFixed(0);

        try {
            airQuality = json.airQuality.results[0].measurements[0].value;
            document.getElementById('aq').textContent = airQuality;
        } catch(error) {
            document.getElementById('aq').parentElement.remove();
            console.error(error);
        }
        
        


    });
} else {
    console.log('geolocation not available');
}
// declare button variable & add click event
const button = document.getElementById('submit-button');
button.addEventListener('click', async (event) => {
    const mood = document.getElementById('mood').value;
    const myStatus = { lat, lon, locationName, weather, mood, airQuality };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(myStatus)
    };
    console.log('posting location to server...');
    const response = await fetch('/api', options);
    const data = await response.json();
    console.log('post complete.');
    console.log(data);
    document.getElementById('mood').value = '';
});

// leaflet.js
const map = L.map('myMap', {
    center: [51.505, -0.09],
    zoom: 9
}).locate({ setView: true, maxZoom: 13 });

const myIcon = L.icon({
    iconUrl: './marker.png',
    iconSize: [40, 40],
});

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);