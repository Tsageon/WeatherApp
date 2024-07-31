import React, { useState } from 'react';
import './Fetchin.css';

const Fetching = () => {
    const [location, setLocation] = useState('');
    const [weather, setWeather] = useState({});
    const [error, setError] = useState(null);
    const Api_Key = '47dd65ecabe0cf32fae0116841fa5da5';

    const handleSearch = async () => {
        if (!location) return;

        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${Api_Key}&units=metric`);
            const data = await response.json();
            console.log(data);

            if (response.ok) {
                setWeather({
                    location: data.name,
                    temperature: data.main.temp,
                    feels_like: data.main.feels_like,
                    temp_min: data.main.temp_min,
                    temp_max: data.main.temp_max,
                    pressure: data.main.pressure,
                    humidity: data.main.humidity,
                    wind_speed: data.wind.speed,
                    wind_deg: data.wind.deg,
                    visibility: data.visibility,
                    description: data.weather[0].description,});
                setError(null);
            } else {
                setError(data.message || 'Something went wrong. Please try again.');
                setWeather({});
            }
        } catch (error) {
            setError('Failed to fetch Weather Data. Please Try Again.');
            setWeather({});
        }};

    return (
        <div className="container">
            <h1>Weather App</h1>
            <input type="text" id="locationInput"
                   placeholder="Enter a city" value={location} onChange={(e) => setLocation(e.target.value)}/>
            <button id="searchButton" onClick={handleSearch}>Search</button>
            {error && <p className="error">{error}</p>}
            {weather.location && (
                <div className="weather-info">
                    <h2 id="location">{weather.location}</h2>
                    <p id="temperature">Temperature: {weather.temperature}°C</p>
                    <p id="feels_like">Feels Like: {weather.feels_like}°C</p>
                    <p id="temp_min">Min Temp: {weather.temp_min}°C</p>
                    <p id="temp_max">Max Temp: {weather.temp_max}°C</p>
                    <p id="pressure">Pressure: {weather.pressure} hPa</p>
                    <p id="humidity">Humidity: {weather.humidity}%</p>
                    <p id="wind_speed">Wind Speed: {weather.wind_speed} m/s</p>
                    <p id="wind_deg">Wind Direction: {weather.wind_deg}°</p>
                    <p id="visibility">Visibility: {weather.visibility} m</p>
                    <p id="description">Weather: {weather.description}</p>
                </div>
            )}
        </div>
    );
};

export default Fetching;