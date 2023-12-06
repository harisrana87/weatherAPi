import React, { useState } from 'react';
import axios from 'axios';
import "./weather.css"




interface WeatherData {
  cityName: string;
  temperature: number;
  humidity: number;
  weather: string;
  forecast?: {
    date: string;
    temperature: number;
    weather: string;
  }[];
  searchResults?: {
    name: string;
    region: string;
    country: string;
    lat:number;
    lon:number;
    url:string;
  }[];
  pastWeather?: any[]; // Add any other fields you need for past weather data
  timeZone?: string; // Add the timeZone field

}
interface ErrorResponse {
  error: {
    message: string;
  };
}
const WeatherApp: React.FC = () => {
  const [cityName, setCityName] = useState<string>('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [endpoint, setEndpoint] = useState<string>('current.json');
  const apiKey = '97498a14838b4226979153804230512'; // Replace with your WeatherAPI key

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCityName(event.target.value);
  };

  const handleEndpointChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setEndpoint(event.target.value);
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const apiUrl = `https://api.weatherapi.com/v1/${endpoint}?key=${apiKey}&q=${cityName}`;
      const response = await axios.get(apiUrl);

      if ('error' in response.data) {
        const errorResponse: ErrorResponse = response.data;
        setError(errorResponse.error.message);
        setWeatherData(null);
      } else {
        let weatherInfo: WeatherData = {
          cityName: cityName,
          temperature: 0,
          humidity: 0,
          weather: '',
        };

        if (endpoint === 'current.json' || endpoint === 'forecast.json') {
          const { current } = response.data;
          weatherInfo = {
            ...weatherInfo,
            temperature: current.temp_c,
            humidity: current.humidity,
            weather: current.condition.text,
          };
        }

        if (endpoint === 'forecast.json') {
          const { forecast } = response.data;
          if (forecast && forecast.forecastday) {
            const forecastData = forecast.forecastday.map((day: any) => ({
              date: day.date,
              temperature: day.day.avgtemp_c,
              weather: day.day.condition.text,
            }));
            weatherInfo = { ...weatherInfo, forecast: forecastData };
          }
        }

        if (endpoint === 'current.json' || endpoint === 'forecast.json' || endpoint === 'timezone.json') {
          const { search } = response.data;
          if (search && search.length > 0) {
            const searchResults = search.map((result: any) => ({
              name: result.name,
              region: result.region,
              country: result.country,
            }));
            weatherInfo = { ...weatherInfo, searchResults: searchResults };
          }
        }
        if (endpoint === 'search.json' || endpoint === 'forecast.json' || endpoint === 'timezone.json') {
          const search = response.data;  // Use a more generic name
          if (search && search.length > 0) {
            const searchResults = search.map((result: any) => ({
              name: result.name,
              region: result.region,
              country: result.country,
              lat: result.lat,
              lon: result.lon,
              url: result.url,
            }));
            weatherInfo = { ...weatherInfo, searchResults: searchResults };
          }
        }

        if (endpoint === 'timezone.json') {
          const { location } = response.data;
          if (location) {
            weatherInfo = { ...weatherInfo, timeZone: location.tz_id };
          }
        }

        setWeatherData(weatherInfo);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError(`An error occurred while fetching weather data for ${endpoint}.`);
      setWeatherData(null);
    }
    
  };

  return (
    
    <div className='Forms'>
      <form onSubmit={handleFormSubmit}>
        <label>
         <h3> Enter City </h3>
          <input type="text" value={cityName} onChange={handleInputChange} />
        </label>
       <p> <label>
         <h3> Select Endpoint</h3>
          <select value={endpoint} onChange={handleEndpointChange}>
            <option value="current.json">Current Weather</option>
            <option value="forecast.json">Forecast</option>
            <option value="timezone.json">Time Zone</option>
            <option value="search.json">Search</option>
          </select>
        </label></p>
        <button type="submit">Get Weather</button>
      </form>

      {error && <div>Error: {error}</div>}

      {weatherData && (
  <div>
    <h2>WeatherApp</h2>
    {endpoint === 'search.json' && weatherData.searchResults && (
  <div>
    <h3>Search Results:</h3>
    
    {weatherData.searchResults.map((result, endpoint) => (
      <div key={endpoint}>
        <p>Name: {result.name}</p>
        <p>Region: {result.region}</p>
        <p>Country: {result.country}</p>
        <p>lat: {result.lat}</p>
        <p>lon: {result.lon}</p>
        <p>url: {result.url}</p>
        
      </div>
    ))}
  </div>
)}
    {endpoint === 'current.json' && (
      <div>
        <h3>Current Weather:</h3>
        <p>Temperature: {weatherData.temperature}°C</p>
        <p>Humidity: {weatherData.humidity}</p>
        <p>Weather: {weatherData.weather}</p>
      </div>
    )}

    {endpoint === 'timezone.json' && (
      <h3>Time Zone: {weatherData.timeZone}</h3>
    )}
     
    {weatherData.forecast && (
      <div>
        <h3>Forecast:</h3>
        {weatherData.forecast.map((day) => (
          <div key={day.date}>
            <p>Date: {day.date}</p>
            <p>Temperature: {day.temperature}°C</p>
            <p>Weather: {day.weather}</p>
          </div>
        ))}
      </div>
    )}
  </div>
)}
    </div>
  );
};

export default WeatherApp;
