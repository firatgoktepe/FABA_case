import React from 'react'
import { useWeather } from '../contexts/WeatherContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useForecastWeather } from '../hooks'
import ForecastItemCard from '../components/ForecastItemCard'

const ForecastList = () => {
  const { currentLocation, units } = useWeather()
  const { t } = useLanguage()

  const { data: forecastData, isLoading, error } = useForecastWeather(currentLocation, units)

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

  return (
    <div className="forecast-list">
      <h2 className="forecast-title">{t('weather.forecast')}</h2>
      
      <div className="forecast-grid">
        {forecastData.daily.map((day, index) => (
          <ForecastItemCard 
            key={index} 
            day={day} 
            index={index}
          />
        ))}
      </div>
    </div>
  )
}

export default ForecastList 