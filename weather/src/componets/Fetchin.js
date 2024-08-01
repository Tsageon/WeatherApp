import React, { useState } from 'react';
import './Fetchin.css';

const Fetching = () => {
    const [location, setLocation] = useState('');
    const [weather, setWeather] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const Api_Key = '47dd65ecabe0cf32fae0116841fa5da5';

    const handleSearch = async () => {
        if (!location.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${Api_Key}&units=metric`);
            const data = await response.json();

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
            } else {
                setError(data.message || 'Something went wrong. Please try again.');
                setWeather({});}
        } catch (error) {
            setError('Failed to get weather data. Please try again.');
            setWeather({});
        } finally {
            setLoading(false);
        }};

    const getWeatherImage = (description) => {
        switch (description.toLowerCase()) {
            case 'clear sky':
                return {
                    url: 'https://images.app.goo.gl/QUHnr2yKeJ1a36GB9',
                    alt: 'Clear Skies',
                    explanation: 'The sky is clear with no clouds.'};
            case 'few clouds':
            case 'scattered clouds':
            case 'broken clouds':
            case 'clouds':
                return {
                    url: 'https://images.app.goo.gl/tyPctWf1GURVHUCr8',
                    alt: 'Cloudy',
                    explanation: 'The sky is partly/fully covered with clouds.'};
            // eslint-disable-next-line no-duplicate-case
            case 'broken clouds':
                return {
                    url: 'https://images.app.goo.gl/aJT9Cus8bMQvqQcN6',
                    alt: 'Broken Clouds',
                    explanation: 'The sky is mostly covered with clouds but sunshine still shinning through.'};
            case 'overcast clouds':
                return {
                    url: 'https://images.app.goo.gl/tyPctWf1GURVHUCr8',
                    alt: 'Overcast Clouds',
                    explanation: 'The sky is completely covered with clouds.'};
            case 'shower rain':
            case 'rain':
                return {
                    url: 'https://images.app.goo.gl/Bu5mGia7Zn2yT3Kk8',
                    alt: 'Rain',
                    explanation: 'It is raining with varying intensity.'};
            case 'thunderstorm':
                return {
                    url: 'https://images.app.goo.gl/BpvKAR1mZcz5zzh6A',
                    alt: 'Thunderstorm',
                    explanation: 'Thunderstorm INCOMING!'};
            case 'snow':
                return {
                    url: 'https://images.app.goo.gl/YucitP5WKo9uJBc19',
                    alt: 'Snow',
                    explanation: 'It is snowing.'};
            case 'mist':
                return {
                    url: 'https://images.app.goo.gl/d7nRhhNMjf8pTWde9',
                    alt: 'Mist',
                    explanation: 'It is misty, prepare for reduced visibility.'};
            case 'sunny':
                return {
                    url: 'https://images.app.goo.gl/T8HysMefku6VjRpv9',
                    alt: 'Sunny',
                    explanation: 'The weather is sunny and clear.'};
            default:
                return {
                    url: 'https://img.icons8.com/?size=100&id=HvsrTtUGylxy&format=png&color=000000',
                    alt: 'Default Weather',
                    explanation: 'Weather image not available.'};
        }
    };

    return (
        <div className="container">
            <h1>Weather App</h1>
            <input 
                type="text" 
                id="locationInput"
                placeholder="Enter a city" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}/>
            <button id="searchButton" onClick={handleSearch} disabled={loading}>
                {loading ? 'Loading...Please wait...' : 'Search'}
            </button>
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
                    <img 
                        id="weather-image" 
                        src={getWeatherImage(weather.description).url} 
                        alt={getWeatherImage(weather.description).alt}/>
                    <p>{getWeatherImage(weather.description).explanation}</p>
                </div>
            )}
        </div>
    );
};

export default Fetching;