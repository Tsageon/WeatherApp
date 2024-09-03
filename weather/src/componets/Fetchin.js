import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Fetchin.css'; 

const API_KEY = '47dd65ecabe0cf32fae0116841fa5da5';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

const NEARBY_CITIES = [
  { name: 'Upington', lat: -28.4520, lon: 21.2561 }, { name: 'Springbok', lat: -29.6643, lon: 17.8865 }, { name: 'Kuruman', lat: -27.4498, lon: 23.4308 },
  { name: 'De Aar', lat: -30.6496, lon: 24.0146 }, { name: 'Colesberg', lat: -30.7197, lon: 25.0978 },
  { name: 'Calvinia', lat: -31.4728, lon: 19.7764 }, { name: 'Douglas', lat: -29.0601, lon: 23.7732 },
  { name: 'Kakamas', lat: -28.7746, lon: 20.6173 },{ name: 'Port Nolloth', lat: -29.2498, lon: 16.8681 },
  { name: 'Hartswater', lat: -27.7351, lon: 24.7961 },{ name: 'Kathu', lat: -27.6957, lon: 23.0471 }];

const Fetching = () => {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState({});
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [surroundingProvinces, setSurroundingProvinces] = useState([]);
  const [fiveDayForecast, setFiveDayForecast] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);
  const [forecastLocation, setForecastLocation] = useState('');

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLong(position.coords.longitude);
      },
      (err) => {
        setError('Unable To Retrieve Location. Please Allow Location Access or Enter a City.');
      });
  }, []);

  const fetchWeatherByCoordinates = useCallback(async (latitude, longitude) => {
    setLoading(true);
    try {
      const weatherResponse = await axios.get(`${WEATHER_BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
      setWeather(formatWeatherData(weatherResponse.data));
      setForecastLocation(weatherResponse.data.name); 
      const forecastResponse = await axios.get(`${FORECAST_BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
      setHourlyForecast(forecastResponse.data.list.slice(0, 5));
      
      const dailyData = forecastResponse.data.list.filter((reading) => reading.dt_txt.includes("12:00:00"));
      const formattedDailyData = dailyData.map((day) => ({
        date: day.dt_txt,dayOfWeek: new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'long' }),
        icon: day.weather[0].icon,description: day.weather[0].description,temp: day.main.temp,
      }));
      setFiveDayForecast(formattedDailyData);

      const nearbyWeatherPromises = NEARBY_CITIES.map(city =>
        axios.get(`${WEATHER_BASE_URL}?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric`)
          .then(response => ({
            name: city.name,temperature: response.data.main.temp,})));
      const nearbyWeatherData = await Promise.all(nearbyWeatherPromises);
      setSurroundingProvinces(nearbyWeatherData);

      setError(null);
    } catch (err) {
      setError('Error Fetching Weather Data.');
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
      setForecastLocation(weatherResponse.data.name); 

      const forecastResponse = await axios.get(`${FORECAST_BASE_URL}?q=${location}&appid=${API_KEY}&units=metric`);
      setHourlyForecast(forecastResponse.data.list.slice(0, 5));
      
      const dailyData = forecastResponse.data.list.filter((reading) => reading.dt_txt.includes("12:00:00"));
      const formattedDailyData = dailyData.map((day) => ({
        date: day.dt_txt,dayOfWeek: new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'long' }),
        icon: day.weather[0].icon,description: day.weather[0].description,temp: day.main.temp,}));
      setFiveDayForecast(formattedDailyData);

      const nearbyWeatherPromises = NEARBY_CITIES.map(city =>
        axios.get(`${WEATHER_BASE_URL}?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric`)
          .then(response => ({
            name: city.name,temperature: response.data.main.temp,})));
      const nearbyWeatherData = await Promise.all(nearbyWeatherPromises);
      setSurroundingProvinces(nearbyWeatherData);

      setError(null);
    } catch (err) {
      setError('Error Fetching Weather Data.');
      setWeather({});
      setHourlyForecast([]);
      setSurroundingProvinces([]);
    } finally {
      setLoading(false);
    }};

  const formatWeatherData = (data) => ({
    location: data.name,temperature: data.main.temp,feels_like: data.main.feels_like,
    temp_min: data.main.temp_min,temp_max: data.main.temp_max, pressure: data.main.pressure,
    humidity: data.main.humidity,wind_speed: data.wind.speed,wind_deg: data.wind.deg,
    visibility: data.visibility,description: data.weather[0].description,icon: data.weather[0].icon,});

  const getWeatherIconUrl = (iconCode) => {
    return `http://openweathermap.org/img/wn/${iconCode}@2x.png`;};

  return (
    <div className="container">
      <h1 className='heading'>Weather App</h1>
      <div className="search-container">
        <input type="text"
          placeholder="Enter a city"
          value={location} onChange={(e) => setLocation(e.target.value)}/>
        <button onClick={fetchWeather} disabled={loading}>{loading ? 'Give me a sec...' : 'Search'}</button>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="main-content">
        {weather.location && (
          <div className="weather-info">
            <h2>{weather.location}</h2>
            <img src={getWeatherIconUrl(weather.icon)} alt={weather.description} />
            <div className="weather-details">
              <p>Description: {weather.description}</p><p>Temperature: {weather.temperature}°C</p>
              <p>Feels Like: {weather.feels_like}°C</p><p>Min Temp: {weather.temp_min}°C</p>
              <p>Max Temp: {weather.temp_max}°C</p><p>Pressure: {weather.pressure} hPa</p>
              <p>Humidity: {weather.humidity}%</p><p>Wind Speed: {weather.wind_speed} m/s</p>
              <p>Wind Direction: {weather.wind_deg}°</p><p>Visibility: {weather.visibility / 1000} km</p>
            </div>
          </div>
        )}

        {surroundingProvinces.length > 0 && (
          <div className="surrounding-provinces">
            <h3>Nearby Cities</h3>
            <ul>{surroundingProvinces.map((city, index) => (
                <li key={index}><b>{city.name}:</b> {city.temperature}°C</li>
              ))}</ul></div>
        )}

        {hourlyForecast.length > 0 && (
          <div className="hourly-forecast">
            <h3 className='heading'>Hourly Forecast for {forecastLocation}</h3>
            <div className="hourly-forecast-grid">
              {hourlyForecast.map((forecast, index) => (
                <div key={index} className="forecast-item">
                  <p>{new Date(forecast.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <img src={getWeatherIconUrl(forecast.weather[0].icon)} alt={forecast.weather[0].description}/>
                  <p>{forecast.main.temp}°C</p><p>{forecast.weather[0].description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {fiveDayForecast.length > 0 && (
          <div className="five-day-forecast">
            <h3 className='heading'>5-Day Forecast for {forecastLocation}</h3>
            <div className="forecast-grid">
              {fiveDayForecast.map((day, index) => (
                <div key={index} className="forecast-item">
                  <p className="day">{day.dayOfWeek}</p><p className="date">{new Date(day.date).toLocaleDateString()}</p>
                  <img src={getWeatherIconUrl(day.icon)} alt={day.description} />
                  <p>{day.temp}°C</p><p>{day.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Fetching;