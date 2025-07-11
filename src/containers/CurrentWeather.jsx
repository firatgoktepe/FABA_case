import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useWeather } from '../contexts/WeatherContext'
import { useLanguage } from '../contexts/LanguageContext'
import weatherService from '../services/weatherService'

const CurrentWeather = () => {
  const { currentLocation, units, isMetric } = useWeather()
  const { t } = useLanguage()

  const { data: weatherData, isLoading, error } = useQuery({
    queryKey: ['currentWeather', currentLocation, units],
    queryFn: () => {
      if (currentLocation) {
        return weatherService.fetchCurrentWeatherByCoords(
          currentLocation.lat, 
          currentLocation.lon, 
          units
        )
      }
      return null
    },
    enabled: !!currentLocation,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  if (isLoading) {
    return (
      <div className="current-weather card">
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p>{t('app.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="current-weather card">
        <div className="error-message">
          <p>{t('errors.networkError')}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            {t('app.retry')}
          </button>
        </div>
      </div>
    )
  }

  if (!weatherData) {
    return (
      <div className="current-weather card">
        <div className="text-center">
          <p>{t('errors.locationError')}</p>
        </div>
      </div>
    )
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@4x.png`
  }

  return (
    <div className="current-weather card">
      <div className="weather-location">
        {weatherData.name}, {weatherData.country}
      </div>
      
      <div className="weather-main">
        <img 
          src={getWeatherIcon(weatherData.weather.icon)}
          alt={weatherData.weather.description}
          className="weather-icon"
        />
        <div className="weather-temperature">
          {weatherData.temperature.current}°{isMetric ? 'C' : 'F'}
        </div>
        <div className="weather-description">
          {weatherData.weather.description}
        </div>
      </div>

      <div className="weather-details">
        <div className="weather-detail">
          <span className="detail-label">{t('weather.feelsLike')}</span>
          <span className="detail-value">
            {weatherData.temperature.feelsLike}°{isMetric ? 'C' : 'F'}
          </span>
        </div>
        
        <div className="weather-detail">
          <span className="detail-label">{t('weather.humidity')}</span>
          <span className="detail-value">{weatherData.details.humidity}%</span>
        </div>
        
        <div className="weather-detail">
          <span className="detail-label">{t('weather.windSpeed')}</span>
          <span className="detail-value">
            {weatherData.details.windSpeed} {isMetric ? t('units.kmh') : t('units.mph')}
          </span>
        </div>
        
        <div className="weather-detail">
          <span className="detail-label">{t('weather.pressure')}</span>
          <span className="detail-value">{weatherData.details.pressure} {t('units.hPa')}</span>
        </div>
        
        {weatherData.details.visibility && (
          <div className="weather-detail">
            <span className="detail-label">{t('weather.visibility')}</span>
            <span className="detail-value">
              {weatherData.details.visibility} {isMetric ? t('units.km') : t('units.mi')}
            </span>
          </div>
        )}
        
        <div className="weather-detail">
          <span className="detail-label">{t('weather.sunrise')}</span>
          <span className="detail-value">{formatTime(weatherData.sun.sunrise)}</span>
        </div>
        
        <div className="weather-detail">
          <span className="detail-label">{t('weather.sunset')}</span>
          <span className="detail-value">{formatTime(weatherData.sun.sunset)}</span>
        </div>
      </div>
    </div>
  )
}

export default CurrentWeather 