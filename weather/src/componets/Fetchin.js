import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Fetchin.css';

const API_KEY = '47dd65ecabe0cf32fae0116841fa5da5';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

const NEARBY_CITIES = [];

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
        setError('Unable to retrieve location. Please allow location access or enter a city.');
      }
    );
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
        date: day.dt_txt,
        icon: day.weather[0].icon,
        description: day.weather[0].description,
        temp: day.main.temp,
      }));
      setFiveDayForecast(formattedDailyData);

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
      setForecastLocation(weatherResponse.data.name); 

      const forecastResponse = await axios.get(`${FORECAST_BASE_URL}?q=${location}&appid=${API_KEY}&units=metric`);
      setHourlyForecast(forecastResponse.data.list.slice(0, 5));
      
      const dailyData = forecastResponse.data.list.filter((reading) => reading.dt_txt.includes("12:00:00"));
      const formattedDailyData = dailyData.map((day) => ({
        date: day.dt_txt,
        icon: day.weather[0].icon,
        description: day.weather[0].description,
        temp: day.main.temp,
      }));
      setFiveDayForecast(formattedDailyData);

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
            <img src={getWeatherIconUrl(weather.icon)} alt={weather.description} />
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

        {hourlyForecast.length > 0 && (
          <div className="hourly-forecast">
            <h3 className='Heading'>Hourly Forecast for {forecastLocation}</h3>
            <div className="hourly-list">
              {hourlyForecast.map((hour, index) => (
                <div key={index} className="hourly-item">
                  <p>{new Date(hour.dt_txt).getHours()}:00</p>
                  <p>{hour.main.temp}°C</p>
                  <img src={getWeatherIconUrl(hour.weather[0].icon)} alt={hour.weather[0].description} />
                </div>
              ))}
            </div>
          </div>
        )}

        {fiveDayForecast.length > 0 && (
          <div className="forecast">
            <h2>5-Day Forecast for {forecastLocation}</h2>
            <div className="forecast-list">
              {fiveDayForecast.map((day, index) => {
                const date = new Date(day.date);
                const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
                return (
                  <div key={index} className="forecast-item">
                    <p>{dayOfWeek}, {date.toLocaleDateString()}</p>
                    <img
                      src={`http://openweathermap.org/img/wn/${day.icon}.png`}
                      alt={day.description}
                      className="forecast-icon"
                    />
                    <p>{day.description}</p>
                    <p>{day.temp}°C</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Fetching;
