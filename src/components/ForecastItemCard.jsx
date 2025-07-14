import React, { useMemo } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeather } from '../contexts/WeatherContext'

const ForecastItemCard = ({ day, index }) => {
  const { t } = useLanguage()
  const { isMetric } = useWeather()

  const formattedDate = useMemo(() => {
    if (index === 0) return t('weather.today')
    return day.date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }, [day.date, index, t])

  const weatherIconUrl = useMemo(() => {
    return `https://openweathermap.org/img/wn/${day.weather.icon}@2x.png`
  }, [day.weather.icon])

  const rainPercentage = useMemo(() => {
    return day.pop > 0 ? Math.round(day.pop * 100) : null
  }, [day.pop])

  return (
    <div className="forecast-item card">
      <div className="forecast-date">
        {formattedDate}
      </div>
      
      <div className="forecast-weather">
        <img 
          src={weatherIconUrl}
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
        {rainPercentage && (
          <div className="detail-item">
            <span>{t('weather.rain')}: {rainPercentage}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForecastItemCard 