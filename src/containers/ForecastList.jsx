import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useWeather } from '../contexts/WeatherContext'
import { useLanguage } from '../contexts/LanguageContext'
import weatherService from '../services/weatherService'

const ForecastList = () => {
  const { currentLocation, units, isMetric } = useWeather()
  const { t } = useLanguage()

  const { data: forecastData, isLoading, error } = useQuery({
    queryKey: ['forecast', currentLocation, units],
    queryFn: () => {
      if (currentLocation) {
        return weatherService.fetchForecast(
          currentLocation.lat, 
          currentLocation.lon, 
          units
        )
      }
      return null
    },
    enabled: !!currentLocation,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })

  if (isLoading) {
    return (
      <div className="forecast-list card">
        <h2 className="forecast-title">{t('weather.forecast')}</h2>
        <div className="text-center">
          <div className="loading-spinner"></div>
          <p>{t('app.loading')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="forecast-list card">
        <h2 className="forecast-title">{t('weather.forecast')}</h2>
        <div className="error-message">
          <p>{t('errors.apiError')}</p>
        </div>
      </div>
    )
  }

  if (!forecastData || !forecastData.daily) {
    return null
  }

  const formatDate = (date) => {
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  }

  return (
    <div className="forecast-list">
      <h2 className="forecast-title">{t('weather.forecast')}</h2>
      
      <div className="forecast-grid">
        {forecastData.daily.map((day, index) => (
          <div key={index} className="forecast-item card">
            <div className="forecast-date">
              {index === 0 ? 'Today' : formatDate(day.date)}
            </div>
            
            <div className="forecast-weather">
              <img 
                src={getWeatherIcon(day.weather.icon)}
                alt={day.weather.description}
                className="forecast-icon"
              />
              <div className="forecast-description">
                {day.weather.description}
              </div>
            </div>
            
            <div className="forecast-temps">
              <div className="forecast-high">
                {t('weather.high')}: {day.temperature.max}°{isMetric ? 'C' : 'F'}
              </div>
              <div className="forecast-low">
                {t('weather.low')}: {day.temperature.min}°{isMetric ? 'C' : 'F'}
              </div>
            </div>
            
            <div className="forecast-details">
              <div className="detail-item">
                <span>{t('weather.humidity')}: {day.humidity}%</span>
              </div>
              <div className="detail-item">
                <span>{t('weather.windSpeed')}: {day.windSpeed} {isMetric ? t('units.kmh') : t('units.mph')}</span>
              </div>
              {day.pop > 0 && (
                <div className="detail-item">
                  <span>Rain: {Math.round(day.pop * 100)}%</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ForecastList 