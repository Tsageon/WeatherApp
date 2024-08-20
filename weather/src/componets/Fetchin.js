import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Fetchin.css';

const API_KEY = '47dd65ecabe0cf32fae0116841fa5da5';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

const NEARBY_CITIES = [
  { name: 'Hartswater', lat: -27.767, lon: 24.817 },
  { name: 'Barkly West', lat: -28.4512448, lon: 24.514946433333 },
  { name: 'Douglas', lat: -29.0500, lon: 23.7667 },
  { name: 'Delportshoop', lat: -28.3989483, lon: 24.2984857 },
  { name: 'Griquatown', lat: -28.430, lon: 23.182 },
  { name: 'Postmasburg', lat: -27.592, lon: 23.074 }, 
  { name: 'Colesberg', lat: -30.675, lon: 24.751 },
  { name: 'Carnarvon', lat: -30.982, lon: 22.587 },
  { name: 'Victoria West', lat: -30.624, lon: 22.481 },
  { name: 'Williston', lat: -30.214, lon: 19.253 },
  { name: 'Sutherland', lat: -32.383, lon: 20.103 },
  { name: 'Garies', lat: -30.633, lon: 17.016 },

];

const Fetching = () => {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState({});
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [surroundingProvinces, setSurroundingProvinces] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLong(position.coords.longitude);
      },
      (err) => {
        setError('Unable to retrieve location. Please allow location access or enter a city.');
      }
    );
  }, []);

  const fetchWeatherByCoordinates = useCallback(async (latitude, longitude) => {
    setLoading(true);
    try {
      const weatherResponse = await axios.get(`${WEATHER_BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
      setWeather(formatWeatherData(weatherResponse.data));

      const forecastResponse = await axios.get(`${FORECAST_BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
      setHourlyForecast(forecastResponse.data.list.slice(0, 5));

      const nearbyWeatherPromises = NEARBY_CITIES.map(city =>
        axios.get(`${WEATHER_BASE_URL}?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric`)
          .then(response => ({
            name: city.name,
            temperature: response.data.main.temp,
          }))
      );
      const nearbyWeatherData = await Promise.all(nearbyWeatherPromises);
      setSurroundingProvinces(nearbyWeatherData);

      setError(null);
    } catch (err) {
      setError('Error fetching weather data.');
      setWeather({});
      setHourlyForecast([]);
      setSurroundingProvinces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (lat && long) {
      fetchWeatherByCoordinates(lat, long);
    }
  }, [lat, long, fetchWeatherByCoordinates]);

  const fetchWeather = async () => {
    if (!location.trim()) return;

    setLoading(true);
    try {
      const weatherResponse = await axios.get(`${WEATHER_BASE_URL}?q=${location}&appid=${API_KEY}&units=metric`);
      setWeather(formatWeatherData(weatherResponse.data));

      const forecastResponse = await axios.get(`${FORECAST_BASE_URL}?q=${location}&appid=${API_KEY}&units=metric`);
      setHourlyForecast(forecastResponse.data.list.slice(0, 5));

      const nearbyWeatherPromises = NEARBY_CITIES.map(city =>
        axios.get(`${WEATHER_BASE_URL}?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric`)
          .then(response => ({
            name: city.name,
            temperature: response.data.main.temp,
          }))
      );
      const nearbyWeatherData = await Promise.all(nearbyWeatherPromises);
      setSurroundingProvinces(nearbyWeatherData);

      setError(null);
    } catch (err) {
      setError('Error fetching weather data.');
      setWeather({});
      setHourlyForecast([]);
      setSurroundingProvinces([]);
    } finally {
      setLoading(false);
    }
  };

  const formatWeatherData = (data) => ({
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
    icon: data.weather[0].icon,
  });

  const getWeatherIconUrl = (iconCode) => {
    return `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  const getWeatherImage = (description) => {
    const images = {
      'clear sky': 'https://www.weatherbit.io/static/img/icons/c01d.png',
      'few clouds': 'https://www.weatherbit.io/static/img/icons/c02d.png',
      'scattered clouds': 'https://www.weatherbit.io/static/img/icons/c02d.png',
      'broken clouds': 'https://www.weatherbit.io/static/img/icons/c03d.png',
      'overcast clouds': 'https://www.weatherbit.io/static/img/icons/c04d.png',
      'shower rain': 'https://www.weatherbit.io/static/img/icons/r01d.png',
      'rain': 'https://www.weatherbit.io/static/img/icons/r01d.png',
      'light rain': 'https://www.weatherbit.io/static/img/icons/r01d.png',
      'thunderstorm': 'https://www.weatherbit.io/static/img/icons/t01d.png',
      'snow': 'https://www.weatherbit.io/static/img/icons/s01d.png',
      'mist': 'https://www.weatherbit.io/static/img/icons/a01d.png',
      'sunny': 'https://www.weatherbit.io/static/img/icons/c01d.png',
    };
  
    return images[description] || 'https://www.weatherbit.io/static/img/icons/c01d.png';
  };
  

  return (
    <div className="container">
      <h1 className='heading'>Weather App</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter a city"
          value={location}
          onChange={(e) => setLocation(e.target.value)}/>
        <button onClick={fetchWeather} disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="main-content">
        {weather.location && (
          <div className="weather-info">
            <h2>{weather.location}</h2>
            <img src={getWeatherIconUrl(weather.icon)}
                 alt={weather.description}/>
            <p>{getWeatherImage(weather.description).explanation}</p>
            <div className="weather-details">
              <p>Description: {weather.description}</p>
              <p>Temperature: {weather.temperature}°C</p>
              <p>Feels Like: {weather.feels_like}°C</p>
              <p>Min Temp: {weather.temp_min}°C</p>
              <p>Max Temp: {weather.temp_max}°C</p>
              <p>Pressure: {weather.pressure} hPa</p>
              <p>Humidity: {weather.humidity}%</p>
              <p>Wind Speed: {weather.wind_speed} m/s</p>
              <p>Wind Direction: {weather.wind_deg}°</p>
              <p>Visibility: {weather.visibility / 1000} km</p>
              </div>
          </div>
        )}

        {surroundingProvinces.length > 0 && (
          <div className="surrounding-provinces">
            <h3>Nearby Cities</h3>
            <ul>
              {surroundingProvinces.map((city, index) => (
                <li key={index}>
                  <b>{city.name}:</b> {city.temperature}°C
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {hourlyForecast.length > 0 && (
        <div className="hourly-forecast">
          <h3 className='Heading'>Hourly Forecast</h3>
          <div className="hourly-list">
            {hourlyForecast.map((hour, index) => (
              <div key={index} className="hourly-item">
                <p>{new Date(hour.dt_txt).getHours()}:00</p>
                <p>{hour.main.temp}°C</p>
                <img src={getWeatherIconUrl(hour.weather[0].icon)}
                     alt={hour.weather[0].description}/>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Fetching;