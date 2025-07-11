import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useWeather } from '../contexts/WeatherContext'

const Header = () => {
  const { theme, toggleTheme, isDark } = useTheme()
  const { t, changeLanguage, currentLanguage, isEnglish } = useLanguage()
  const { units, toggleUnits, isMetric } = useWeather()

  const handleLanguageChange = () => {
    changeLanguage(isEnglish ? 'es' : 'en')
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <h1 className="header-title">{t('app.title')}</h1>
          
          <div className="header-controls">
            <button 
              className="btn btn-secondary"
              onClick={toggleUnits}
              title={t('settings.units')}
            >
              {isMetric ? t('units.metric') : t('units.imperial')}
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={handleLanguageChange}
              title={t('settings.language')}
            >
              {isEnglish ? 'ES' : 'EN'}
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={toggleTheme}
              title={t('settings.theme')}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 