import React, { useCallback } from 'react'
import { useWeather } from '../contexts/WeatherContext'
import { useLanguage } from '../contexts/LanguageContext'

const SavedCities = () => {
  const { savedCities, removeSavedCity, updateCurrentLocation } = useWeather()
  const { t } = useLanguage()

  const handleCityClick = useCallback((city) => {
    const lat = city.coordinates?.lat ?? null
    const lon = city.coordinates?.lon ?? null
    updateCurrentLocation({ lat, lon })
  }, [updateCurrentLocation])

  const handleRemoveCity = useCallback((e, cityId) => {
    e.stopPropagation()
    removeSavedCity(cityId)
  }, [removeSavedCity])

  if (!savedCities || savedCities.length === 0) {
    return (
      <div className="saved-cities">
        <h3 className="saved-cities-title">{t('cities.saved')}</h3>
        <div className="card">
          <p className="text-center">{t('cities.noSaved')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="saved-cities">
      <h3 className="saved-cities-title">{t('cities.saved')}</h3>
      
      <div className="saved-cities-grid">
        {savedCities.map((city) => (
          <div 
            key={city.id} 
            className="saved-city-item"
            onClick={() => handleCityClick(city)}
          >
            <div className="saved-city-info">
              <div className="saved-city-name">
                {city.name}, {city.country}
              </div>
              {city.temperature && (
                <div className="saved-city-temp">
                  {city.temperature.current}°
                </div>
              )}
            </div>
            
            <button
              className="remove-city-btn"
              onClick={(e) => handleRemoveCity(e, city.id)}
              title={t('cities.remove')}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SavedCities 