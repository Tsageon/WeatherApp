import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Loader from './loader';
import Swal from 'sweetalert2';
import './Fetchin.css';

const API_KEY = '47dd65ecabe0cf32fae0116841fa5da5';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';

const Fetching = () => {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState({});
  const [hourlyForecast, setHourlyForecast] = useState([]);
  const [fiveDayForecast, setFiveDayForecast] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);
  const [isFahrenheit, setIsFahrenheit] = useState(false);
  const [theme, setTheme] = useState('light');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [savedLocations, setSavedLocations] = useState([]);

  const formatWeatherData = (data) => ({
    location: data.name,
    temperature: data.main.temp,
    feels_like: data.main.feels_like,
    temp_min: data.main.temp_min,
    temp_max: data.main.temp_max,
    pressure: data.main.pressure,
    humidity: data.main.humidity,
    wind_speed: data.wind.speed,
    visibility: data.visibility,
    description: data.weather[0].description,
    icon: data.weather[0].icon,
  });

  const formatFiveDayForecast = (list) => {
    return list
      .filter(reading => reading.dt_txt.includes("12:00:00"))
      .map(day => ({
        date: day.dt_txt,
        dayOfWeek: new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'long' }),
        icon: day.weather[0].icon,
        description: day.weather[0].description,
        temp: day.main.temp,
        humidity: day.main.humidity,
        wind_speed: day.wind.speed,
      }));
  };

  const toggleTemperatureUnit = () => setIsFahrenheit(prev => !prev);

  const convertTemperature = (temp) => isFahrenheit ? (temp * 9 / 5 + 32).toFixed(1) : temp;

  const getWeatherIconUrl = (iconCode) => `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };



  const checkSevereWeather = (weatherData) => {
    const severeConditions = ['Thunderstorm', 'Tornado', 'Hurricane', 'Flood', 'Snow'];
    const condition = weatherData.weather[0].main;
  
    if (severeConditions.includes(condition)) {
      const warningMessage = `Severe weather detected in ${weatherData.name}: ${condition}. Please take necessary precautions.`;

      Swal.fire({
        icon: 'warning',
        title: 'Severe Weather Alert',
        text: warningMessage,
        confirmButtonText: 'OK',
      });
  
      const mailtoUrl = `mailto:?subject=Severe Weather Alert: ${condition}&body=${encodeURIComponent(warningMessage)}`;
      window.location.href = mailtoUrl;
    }
  };

  const fetchWeatherByCoordinates = useCallback(async (latitude, longitude) => {
    setLoading(true);
    try {
      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(`${WEATHER_BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`),
        axios.get(`${FORECAST_BASE_URL}?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`)
      ]);
      

      setWeather(formatWeatherData(weatherResponse.data));
      setHourlyForecast(forecastResponse.data.list.slice(0, 5));
      setFiveDayForecast(formatFiveDayForecast(forecastResponse.data.list));

      setError(null);
    } catch (err) {
      setError('Error fetching weather data.');
      setWeather({});
      setHourlyForecast([]);
      setFiveDayForecast([]);
    } finally {
      setLoading(false);
    }
  }, []);

 
  const fetchWeatherByCity = async () => {
    if (!location.trim()) return;
    setLoading(true);
    try {
      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(`${WEATHER_BASE_URL}?q=${location}&appid=${API_KEY}&units=metric`),
        axios.get(`${FORECAST_BASE_URL}?q=${location}&appid=${API_KEY}&units=metric`),
      ]);

      const weatherData = weatherResponse.data;
      const forecastData = forecastResponse.data;

      setWeather(formatWeatherData(weatherData));
      setHourlyForecast(forecastData.list.slice(0, 5));
      setFiveDayForecast(formatFiveDayForecast(forecastData.list));

      checkSevereWeather(weatherData);

      const newLocation = {
        name: location,
        lat: weatherData.coord.lat,
        lon: weatherData.coord.lon,
        weather: formatWeatherData(weatherData),
      };

      setSavedLocations(prevLocations => {
        const updatedLocations = [...prevLocations, newLocation];
        localStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
        return updatedLocations;
      });

      setError(null);
    } catch (err) {
      setError('Error fetching weather data.');
      setWeather({});
      setHourlyForecast([]);
      setFiveDayForecast([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleNetworkChange = () => {
      console.log('Network status changed:', navigator.onLine);
      const onlineStatus = navigator.onLine;
      setIsOnline(onlineStatus);
  
      if (onlineStatus) {
        console.log('Online status detected. Showing success alert.');
        Swal.fire({
          icon: 'success',
          title: 'You are back online!',
          text: 'Everything is back to normal.',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        console.log('Offline status detected. Showing error alert.');
        Swal.fire({
          icon: 'error',
          title: 'You are offline!',
          text: 'Some features may not be available until you are back online.',
          timer: 3000,
          showConfirmButton: false,
        });
      }
    };
  
    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);
  
    if (navigator.onLine) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLong(position.coords.longitude);
        },
        (err) => {
          console.log('Geolocation error:', err);
          setError('Unable to retrieve location. Please allow location access or enter a city.');
  
          Swal.fire({
            icon: 'error',
            title: 'Location Error',
            text: 'Unable to retrieve location. Please allow location access or enter a city.',
            confirmButtonText: 'OK',
          });
        }
      );
    } else {
      const savedWeatherData = localStorage.getItem('savedWeatherData');
      if (savedWeatherData) {
        setWeather(JSON.parse(savedWeatherData));
      } else {
        setError('No saved weather data available. Please check your internet connection and try again.');
  
        Swal.fire({
          icon: 'info',
          title: 'No Saved Weather Data',
          text: 'No saved weather data available. Please check your internet connection and try again.',
          confirmButtonText: 'OK',
        });
      }
    }
  
  
    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, [isOnline]); 
  


  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem('savedLocations');
    if (savedData) {
      setSavedLocations(JSON.parse(savedData));
    }
  }, []);


  useEffect(() => {
    localStorage.setItem('savedWeatherData', JSON.stringify(weather));
  }, [weather]);

  const fetchRef = useRef(fetchWeatherByCoordinates); 

  useEffect(() => {
    fetchRef.current = fetchWeatherByCoordinates;
  }, [fetchWeatherByCoordinates]);

  useEffect(() => {
    const fetchData = async () => {
      if (lat && long) {
        await fetchRef.current(lat, long); 
      }
    };

    fetchData();

    const intervalId = setInterval(() => {
      if (lat && long) {
        fetchRef.current(lat, long);
      }
    }, 300000); 

    return () => clearInterval(intervalId); 
  }, [lat, long]);

  const removeLocation = (location) => {
    const updatedLocations = savedLocations.filter(loc => loc.name !== location.name);
    setSavedLocations(updatedLocations);
    localStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
  };

  const handleLocationSelect = (location) => {
    setLocation(location.name);
    fetchWeatherByCoordinates(location.lat, location.lon);
  };


  return (
    <div className={`container ${theme}`}>
    <h1 className='heading'><b><i>Weather App</i></b></h1>
    <div className='search-container input'>
      <input
        type='text'
        placeholder='Enter a city...'
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <button className="search-button" onClick={fetchWeatherByCity}>Get Weather</button>
    </div>

    <div className="saved-locations">
        <h3>Saved Locations</h3>
        {savedLocations.length > 0 ? (
          <ul>
            {savedLocations.map((location, index) => (
              <li key={index}>
                <button onClick={() => handleLocationSelect(location)}>{location.name}</button>
                <button onClick={() => removeLocation(location)}>Remove</button>
              </li>
            ))}
          </ul>
        ) : (
          <p><i>No saved locations</i></p>
        )}
      </div>

    <div className='toggle-container'>
      <button className="toggle-button" onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
      </button>
      <button className='toggle-button' onClick={toggleTemperatureUnit}>
        Switch to {isFahrenheit ? 'Celsius' : 'Fahrenheit'}
      </button>
    </div>

    {loading && <Loader/>}
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