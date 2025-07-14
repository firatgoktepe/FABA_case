import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeather } from '../contexts/WeatherContext'
import { useWeatherFormatting } from '../hooks'

const ForecastItemCard = ({ day, index }) => {
  const { t } = useLanguage()
  const { isMetric } = useWeather()
  const { formatForecastDate, getWeatherIconUrl, formatPrecipitation } = useWeatherFormatting()

  return (
    <div className="forecast-item card">
      <div className="forecast-date">
        {formatForecastDate(day.date, index)}
      </div>
      
      <div className="forecast-weather">
        <img 
          src={getWeatherIconUrl(day.weather.icon)}
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
        {formatPrecipitation(day.pop) && (
          <div className="detail-item">
            <span>{t('weather.rain')}: {formatPrecipitation(day.pop)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForecastItemCard 