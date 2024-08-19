import React, { useState, useEffect} from 'react';
import './Fetchin.css';

const Fetching = () => {
    const [location, setLocation] = useState('');
    const [weather, setWeather] = useState({});
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lat, setLat] = useState(null);
    const [long, setLong] = useState(null);

    const Api_Key = '47dd65ecabe0cf32fae0116841fa5da5';

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(function(position) {
            setLat(position.coords.latitude);
            setLong(position.coords.longitude);
        });
    }, []);

    useEffect(() => {
        if (lat && long) {
            const fetchWeather = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${Api_Key}&units=metric`);
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
                            description: data.weather[0].description,
                        });
                    } else {
                        setError(data.message || 'Something went wrong. Please try again.');
                        setWeather({});
                    }
                } catch (error) {
                    setError('Failed to get weather data. Please try again.');
                    setWeather({});
                } finally {
                    setLoading(false);
                }
            };

            fetchWeather();
        }
    }, [lat, long]);

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
                    description: data.weather[0].description,
                });
            } else {
                setError(data.message || 'Something went wrong. Please try again.');
                setWeather({});
            }
        } catch (error) {
            setError('Failed to get weather data. Please try again.');
            setWeather({});
        } finally {
            setLoading(false);
        }
    };


   

    const getWeatherImage = (description) => {
        switch (description.toLowerCase()) {
            case 'clear sky':
                return {
                    url: 'https://www.weatherbit.io/static/img/icons/c01d.png',
                    alt: 'Clear Skies',
                    explanation: 'The sky is clear with no clouds.',
                };
            case 'few clouds':
                return {
                    url: 'https://www.weatherbit.io/static/img/icons/c02d.png',
                    alt: 'Few Clouds',
                    explanation: 'There are a few clouds in the sky.',
                };
            case 'scattered clouds':
                return {
                    url: 'https://www.weatherbit.io/static/img/icons/c02d.png',
                    alt: 'Scattered Clouds',
                    explanation: 'There are scattered clouds in the sky.',
                };
            case 'broken clouds':
                return {
                    url: 'https://www.weatherbit.io/static/img/icons/c03d.png',
                    alt: 'Broken Clouds',
                    explanation: 'The sky is mostly covered with clouds.',
                };
            case 'overcast clouds':
                return {
                    url: 'https://www.weatherbit.io/static/img/icons/c04d.png',
                    alt: 'Overcast Clouds',
                    explanation: 'The sky is completely covered with clouds.',
                };
            case 'shower rain':
                return {
                    url: 'https://www.weatherbit.io/static/img/icons/r01d.png',
                    alt: 'Shower Rain',
                    explanation: 'There is light rain.',
                };
            case 'rain':
                return {
                    url: 'https://www.weatherbit.io/static/img/icons/r01d.png',
                    alt: 'Rain',
                    explanation: 'It is raining with varying intensity.',
                };
            case 'light rain':
                return {
                    url: 'https://www.weatherbit.io/static/img/icons/r01d.png',
                    alt: 'Light Rain',
                    explanation: 'There is light rain.',
                };
            case 'thunderstorm':
                return {
                    url: 'https://www.weatherbit.io/static/img/icons/t01d.png',
                    alt: 'Thunderstorm',
                    explanation: 'There are thunderstorms in the area.',
                };
            case 'snow':
                return {
                    url: 'https://www.weatherbit.io/static/img/icons/s01d.png',
                    alt: 'Snow',
                    explanation: 'It is snowing.',
                };
            case 'mist':
                return {
                    url: 'https://www.weatherbit.io/static/img/icons/a01d.png',
                    alt: 'Mist',
                    explanation: 'It is misty, prepare for reduced visibility.',
                };
            case 'sunny':
                return {
                    url: 'https://www.weatherbit.io/static/img/icons/c01d.png',
                    alt: 'Sunny',
                    explanation: 'The weather is sunny and clear.',
                };
            default:
                return {
                    url: 'https://img.icons8.com/?size=100&id=HvsrTtUGylxy&format=png&color=000000',
                    alt: 'Default Weather',
                    explanation: 'Weather image not available yet.',
                };
        }
    };

    return (
        <div className="container">
            <h1>Weather App</h1>
            <div className="search-container">
                <input
                    type="text"
                    id="locationInput"
                    placeholder="Enter a city"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                />
                <button id="searchButton" onClick={handleSearch} disabled={loading}>
                    {loading ? 'Loading...' : 'Search'}
                </button>
            </div>
            {error && <p className="error">{error}</p>}
            {weather.location && (
                <div className="weather-info" aria-live="polite">
                    <h2 id="location">{weather.location}</h2>
                    <img
                        id="weather-image"
                        src={getWeatherImage(weather.description).url}
                        alt={getWeatherImage(weather.description).alt}
                    />
                    <p className="weather-description">{getWeatherImage(weather.description).explanation}</p>
                    <div className="weather-item">
                        <p id="temperature">Temperature: {weather.temperature}°C</p>
                        <p id="feels_like">Feels Like: {weather.feels_like}°C</p>
                        <p id="temp_min">Min Temp: {weather.temp_min}°C</p>
                        <p id="temp_max">Max Temp: {weather.temp_max}°C</p>
                        <p id="pressure">Pressure: {weather.pressure} hPa</p>
                    </div>
                    <div className="weather-item">
                        <p id="humidity">Humidity: {weather.humidity}%</p>
                        <p id="wind_speed">Wind Speed: {weather.wind_speed} m/s</p>
                        <p id="wind_deg">Wind Direction: {weather.wind_deg}°</p>
                        <p id="visibility">Visibility: {weather.visibility} m</p>
                        <p id="description">Weather: {weather.description}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Fetching;