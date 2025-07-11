// OpenWeatherMap API configuration
export const API_CONFIG = {
  BASE_URL: 'https://api.openweathermap.org/data/2.5',
  // Use working API key as fallback (from original PRD)
  API_KEY: import.meta.env.VITE_OPENWEATHER_API_KEY || '2abd0f5e273e0a0d783b92973da61132',
  ENDPOINTS: {
    CURRENT_WEATHER: '/weather',
    FORECAST: '/forecast'
  }
}

// Debug environment variables
console.log('Environment check:')
console.log('- VITE_OPENWEATHER_API_KEY:', import.meta.env.VITE_OPENWEATHER_API_KEY ? 'SET' : 'NOT SET')
console.log('- Using API key:', API_CONFIG.API_KEY.substring(0, 8) + '...')

// API URLs
export const API_URLS = {
  currentWeather: (q, units = 'metric') => 
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CURRENT_WEATHER}?q=${q}&appid=${API_CONFIG.API_KEY}&units=${units}`,
  
  currentWeatherByCoords: (lat, lon, units = 'metric') => 
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CURRENT_WEATHER}?lat=${lat}&lon=${lon}&appid=${API_CONFIG.API_KEY}&units=${units}`,
  
  // Use 5-day forecast API instead of deprecated OneCall API
  forecastByCoords: (lat, lon, units = 'metric') => 
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORECAST}?lat=${lat}&lon=${lon}&appid=${API_CONFIG.API_KEY}&units=${units}`,
  
  forecast: (q, units = 'metric') => 
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FORECAST}?q=${q}&appid=${API_CONFIG.API_KEY}&units=${units}`
}

// Weather condition mappings
export const WEATHER_CONDITIONS = {
  CLEAR: 'clear',
  CLOUDS: 'clouds',
  RAIN: 'rain',
  DRIZZLE: 'drizzle',
  THUNDERSTORM: 'thunderstorm',
  SNOW: 'snow',
  MIST: 'mist',
  SMOKE: 'smoke',
  HAZE: 'haze',
  DUST: 'dust',
  FOG: 'fog',
  SAND: 'sand',
  ASH: 'ash',
  SQUALL: 'squall',
  TORNADO: 'tornado'
} 