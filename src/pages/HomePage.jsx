import React, { useCallback } from 'react'
import Header from '../components/Header'
import SearchBar from '../components/SearchBar'
import CurrentWeather from '../containers/CurrentWeather'
import ForecastList from '../containers/ForecastList'
import SavedCities from '../components/SavedCities'
import ErrorBoundary from '../components/ErrorBoundary'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeather } from '../contexts/WeatherContext'
import weatherService from '../services/weatherService'

const HomePage = () => {
  const { t } = useLanguage()
  const { updateCurrentLocation, addSavedCity, units } = useWeather()

  const handleSearch = useCallback(async (cityName) => {
    try {
      // Fetch weather data for the searched city
      const weatherData = await weatherService.fetchCurrentWeather(cityName, units)
      
      // Update current location to show weather for searched city
      updateCurrentLocation({
        lat: weatherData.coordinates.lat,
        lon: weatherData.coordinates.lon
      })
      
      // Add to saved cities if not already saved
      addSavedCity({
        id: weatherData.id,
        name: weatherData.name,
        country: weatherData.country,
        coordinates: weatherData.coordinates,
        temperature: weatherData.temperature
      })
      
    } catch (error) {
      console.error('Search failed:', error)
      throw error // Re-throw so SearchBar can handle the error
    }
  }, [units, updateCurrentLocation, addSavedCity])

  return (
    <div className="home-page">
      <ErrorBoundary>
        <Header />
        <main className="main-content">
          <div className="container">
            <SearchBar onSearch={handleSearch} />
            <CurrentWeather />
            <ForecastList />
            <SavedCities />
          </div>
        </main>
      </ErrorBoundary>
    </div>
  )
}

export default HomePage 