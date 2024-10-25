import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Fetchin.css';

const API_KEY = '47dd65ecabe0cf32fae0116841fa5da5';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

const NEARBY_CITIES = [
  { name: 'Upington', lat: -28.4520, lon: 21.2561 },
  { name: 'Springbok', lat: -29.6643, lon: 17.8865 },
  { name: 'Kuruman', lat: -27.4498, lon: 23.4308 },
  { name: 'De Aar', lat: -30.6496, lon: 24.0146 },
  { name: 'Colesberg', lat: -30.7197, lon: 25.0978 },
  { name: 'Calvinia', lat: -31.4728, lon: 19.7764 },
  { name: 'Douglas', lat: -29.0601, lon: 23.7732 },
  { name: 'Kakamas', lat: -28.7746, lon: 20.6173 },
  { name: 'Port Nolloth', lat: -29.2498, lon: 16.8681 },
  { name: 'Hartswater', lat: -27.7351, lon: 24.7961 },
  { name: 'Kathu', lat: -27.6957, lon: 23.0471 },
];

const Fetching = () => {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState({});
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [, setSurroundingProvinces] = useState([]);
  const [fiveDayForecast, setFiveDayForecast] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);
  const [, setForecastLocation] = useState('');
  const [isFahrenheit, setIsFahrenheit] = useState(false);
  const [theme] = useState('light');
  const [, setWeatherData] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const savedData = localStorage.getItem('savedWeatherData');
    if (savedData) {
      setWeather(JSON.parse(savedData));
    }
  }, []);


  useEffect(() => {
    const fetchWeather = (latitude, longitude) => {
      const apiKey = '47dd65ecabe0cf32fae0116841fa5da5';
      const apiUrl = `'https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          setWeatherData(data);
          localStorage.setItem('weatherData', JSON.stringify(data)); 
        })
        .catch(error => {
          console.error('Error fetching weather data:', error);
          setError('Error fetching weather data. Please try again later.');
        });
    };

    if (navigator.onLine) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLong(position.coords.longitude);
          fetchWeather(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          setError('Unable to retrieve location. Please allow location access or enter a city.');
        }
      );
    } else {
     
      const savedWeatherData = localStorage.getItem('weatherData');
      if (savedWeatherData) {
        setWeatherData(JSON.parse(savedWeatherData)); 
      } else {
        setError('No saved weather data available. Please check your internet connection and try again.');
      }
    }
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
        dayOfWeek: new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'long' }),
        icon: day.weather[0].icon,
        description: day.weather[0].description,
        temp: day.main.temp,
        humidity: day.main.humidity,
        wind_speed: day.wind.speed,
      }));
      setFiveDayForecast(formattedDailyData);

      const nearbyWeatherPromises = NEARBY_CITIES.map(city =>
        axios.get(`${WEATHER_BASE_URL}?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric`)
          .then(response => ({ name: city.name, temperature: response.data.main.temp }))
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
        dayOfWeek: new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'long' }),
        icon: day.weather[0].icon,
        description: day.weather[0].description,
        temp: day.main.temp,
        humidity: day.main.humidity,
        wind_speed: day.wind.speed,
      }));
      setFiveDayForecast(formattedDailyData);

      const nearbyWeatherPromises = NEARBY_CITIES.map(city =>
        axios.get(`${WEATHER_BASE_URL}?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric`)
          .then(response => ({ name: city.name, temperature: response.data.main.temp }))
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

  const getWeatherIconUrl = (iconCode) => `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

  const toggleTemperatureUnit = () => setIsFahrenheit(!isFahrenheit);

  const convertTemperature = (temp) => isFahrenheit ? (temp * 9 / 5 + 32).toFixed(1) : temp;

  useEffect(() => {
    const handleNetworkChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      const savedData = localStorage.getItem('savedWeatherData');
      if (savedData) {
        setWeather(JSON.parse(savedData));
      }
    }
  }, [isOnline]);

  useEffect(() => {
    localStorage.setItem('savedWeatherData', JSON.stringify(weather));
  }, [weather]);

  const saveWeatherData = () => {
    localStorage.setItem('savedWeatherData', JSON.stringify(weather));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      saveWeatherData();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    return () => clearInterval(interval); // Clear the interval on component unmount
  }, [weather]);
  
  return (
    <div className={`container ${theme}`}>
      <h1 className='heading'>Weather App</h1>
      <div className='search-container input'>
        <input
          type='text'
          placeholder='Enter a city...'
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button className="search-button" onClick={fetchWeather}>Get Weather</button>
      </div>
      <div><button className='toggle-button ' onClick={toggleTemperatureUnit}>
          Switch to {isFahrenheit ? 'Celsius' : 'Fahrenheit'}
        </button></div>
      {loading && <p>Loading...</p>}
      {error && <p className='error'>{error}</p>}

      {weather.location && (
          <div className='weather-info'>
            <h2>{weather.location}</h2>
            <img src={getWeatherIconUrl(weather.icon)} alt={weather.description} />
            <div className='weather-details'>
              <p>{convertTemperature(weather.temperature)}° {isFahrenheit ? 'F' : 'C'}</p>
              <p>Feels Like: {convertTemperature(weather.feels_like)}° {isFahrenheit ? 'F' : 'C'}</p>
              <p>Min: {convertTemperature(weather.temp_min)}° {isFahrenheit ? 'F' : 'C'}</p>
              <p>Max: {convertTemperature(weather.temp_max)}° {isFahrenheit ? 'F' : 'C'}</p>
              <p>Humidity: {weather.humidity}%</p>
              <p>Wind Speed: {weather.wind_speed} m/s</p>
              <p>Pressure: {weather.pressure} hPa</p>
              <p>Visibility: {weather.visibility / 1000} km</p>
              <p>Description: {weather.description}</p>
            </div>
          </div>
        )}
      
      <div className='container-forecast'>
        {hourlyForecast.length > 0 && (
          <div className='hourly-forecast'>
            <h3>Hourly Forecast</h3>
            {hourlyForecast.map((hour, index) => (
              <div key={index}>
                <p>{new Date(hour.dt_txt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p>{convertTemperature(hour.main.temp)}° {isFahrenheit ? 'F' : 'C'}</p>
              </div>
            ))}
          </div>
        )}
        {fiveDayForecast.length > 0 && (
          <div className='five-day-forecast'>
            <h3>5-Day Forecast</h3>
            {fiveDayForecast.map((day, index) => (
              <div key={index}>
                <p>{day.dayOfWeek} - {day.date}</p>
                <img src={getWeatherIconUrl(day.icon)} alt={day.description} />
                <p>{convertTemperature(day.temp)}° {isFahrenheit ? 'F' : 'C'}</p>
                <p>Humidity: {day.humidity}%</p>
                <p>Wind Speed: {day.wind_speed} m/s</p>
        
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Fetching;