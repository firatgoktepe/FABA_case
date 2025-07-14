import { useMemo } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

/**
 * Custom hook for weather-related formatting utilities
 * @returns {object} - Formatting functions
 */
export const useWeatherFormatting = () => {
  const { t } = useLanguage()

  // Memoize formatting functions to prevent recreation on every render
  const formatters = useMemo(() => ({
    /**
     * Format time from Date object
     * @param {Date} date - Date object
     * @returns {string} - Formatted time string
     */
    formatTime: (date) => {
      if (!date || !(date instanceof Date)) return ''
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    },

    /**
     * Format date for forecast items
     * @param {Date} date - Date object
     * @param {number} index - Index (0 = today)
     * @returns {string} - Formatted date string
     */
    formatForecastDate: (date, index = 0) => {
      if (!date || !(date instanceof Date)) return ''
      
      if (index === 0) return t('weather.today')
      
      return date.toLocaleDateString([], { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    },

    /**
     * Get weather icon URL
     * @param {string} iconCode - OpenWeatherMap icon code
     * @param {string} size - Icon size ('2x' or '4x')
     * @returns {string} - Icon URL
     */
    getWeatherIconUrl: (iconCode, size = '2x') => {
      if (!iconCode) return ''
      return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`
    },

    /**
     * Format precipitation percentage
     * @param {number} pop - Probability of precipitation (0-1)
     * @returns {number|null} - Rounded percentage or null
     */
    formatPrecipitation: (pop) => {
      if (!pop || pop <= 0) return null
      return Math.round(pop * 100)
    },

    /**
     * Format temperature with unit
     * @param {number} temp - Temperature value
     * @param {boolean} isMetric - Whether to use metric units
     * @returns {string} - Formatted temperature
     */
    formatTemperature: (temp, isMetric = true) => {
      if (temp === null || temp === undefined) return ''
      return `${Math.round(temp)}°${isMetric ? 'C' : 'F'}`
    },

    /**
     * Format wind speed with unit
     * @param {number} speed - Wind speed value
     * @param {boolean} isMetric - Whether to use metric units
     * @returns {string} - Formatted wind speed
     */
    formatWindSpeed: (speed, isMetric = true) => {
      if (speed === null || speed === undefined) return ''
      return `${speed} ${isMetric ? t('units.kmh') : t('units.mph')}`
    }
  }), [t])

  return formatters
} 