import React, { useState } from 'react';
import axios from 'axios';

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
  }[];
  pastWeather?: {
    date: string;
    temperature: number;
    weather: string;
  }[];
}

interface ErrorResponse {
  error: {
    code: number;
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
      const apiUrl =
        endpoint === 'ip.json'
          ? `https://api.weatherapi.com/v1/${endpoint}?key=${apiKey}`
          : `https://api.weatherapi.com/v1/${endpoint}?key=${apiKey}&q=${cityName}`;

      if (endpoint === 'search.json' && !cityName) {
        setError('City name is required for the search.');
        setWeatherData(null);
        return;
      }

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

        if (endpoint === 'current.json' || endpoint === 'ip.json') {
          const { current } = response.data;
          weatherInfo = {
            ...weatherInfo,
            temperature: current.temp_c,
            humidity: current.humidity,
            weather: current.condition.text,
          };
        } else if (endpoint === 'forecast.json') {
          const { forecast } = response.data;
          if (forecast && forecast.forecastday) {
            const forecastData = forecast.forecastday.map((day: any) => ({
              date: day.date,
              temperature: day.day.avgtemp_c,
              weather: day.day.condition.text,
            }));
            weatherInfo = { ...weatherInfo, forecast: forecastData };
          }
        } else if (endpoint === 'search.json') {
          const { search_results } = response.data;
          if (search_results && search_results.length > 0) {
            const searchResults = search_results.map((result: any) => ({
              name: result.name,
              region: result.region,
              country: result.country,
            }));
            weatherInfo = { ...weatherInfo, searchResults: searchResults };
          } else {
            setError('No search results found for the provided city.');
            setWeatherData(null);
            return;
          }
        } else if (endpoint === 'history.json' || endpoint === 'future.json') {
          const { forecast } = response.data;
          if (forecast && forecast.forecastday) {
            const pastWeatherData = forecast.forecastday.map((day: any) => ({
              date: day.date,
              temperature: day.day.avgtemp_c,
              weather: day.day.condition.text,
            }));
            weatherInfo = { ...weatherInfo, pastWeather: pastWeatherData };
          }
        } else if (endpoint === 'ip.json' || endpoint === 'current.json') {
          const { forecast } = response.data;
          if (forecast && forecast.forecastday) {
            const pastWeatherData = forecast.forecastday.map((day: any) => ({
              date: day.date,
              temperature: day.day.avgtemp_c,
              weather: day.day.condition.text,
            }));
            weatherInfo = { ...weatherInfo, pastWeather: pastWeatherData };
          }
        }

        setWeatherData(weatherInfo);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('An error occurred while fetching weather data.');
      setWeatherData(null);
    }
  };

  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <label>
          Enter City:
          <input type="text" value={cityName} onChange={handleInputChange} />
        </label>
        <label>
          Select Endpoint:
          <select value={endpoint} onChange={handleEndpointChange}>
            <option value="current.json">Current Weather</option>
            <option value="forecast.json">Forecast</option>
            <option value="search.json">Search</option>
            <option value="history.json">History</option>
            <option value="future.json">Future</option>
            <option value="ip.json">IP Location</option>
          </select>
        </label>
        <button type="submit">Get Weather</button>
      </form>

      {error && <div>Error: {error}</div>}

      {weatherData && (
        <div>
          <h2>WeatherApp</h2>
          <h3>City: {weatherData.cityName}</h3>
          <h3>Temperature: {weatherData.temperature}°C</h3>
          <h3>Humidity: {weatherData.humidity}%</h3>
          <h3>Weather: {weatherData.weather}</h3>

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

          {weatherData.searchResults && (
            <div>
              <h3>Search Results:</h3>
              {weatherData.searchResults.map((result, index) => (
                <div key={index}>
                  <p>Name: {result.name}</p>
                  <p>Region: {result.region}</p>
                  <p>Country: {result.country}</p>
                </div>
              ))}
            </div>
          )}

          {weatherData.pastWeather && (
            <div>
              <h3>Past Weather:</h3>
              {weatherData.pastWeather.map((day) => (
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
