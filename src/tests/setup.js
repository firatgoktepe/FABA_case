import '@testing-library/jest-dom'

// Mock react-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'app.title': 'Weather Forecast',
        'app.loading': 'Loading...',
        'app.retry': 'Retry',
        'search.placeholder': 'Search for a city...',
        'search.button': 'Search',
        'weather.current': 'Current Weather',
        'weather.forecast': 'Forecast',
        'weather.today': 'Today',
        'weather.high': 'High',
        'weather.low': 'Low',
        'weather.humidity': 'Humidity',
        'weather.windSpeed': 'Wind Speed',
        'weather.pressure': 'Pressure',
        'weather.visibility': 'Visibility',
        'weather.sunrise': 'Sunrise',
        'weather.sunset': 'Sunset',
        'weather.feelsLike': 'Feels like',
        'weather.rain': 'Rain',
        'units.metric': 'Metric',
        'units.imperial': 'Imperial',
        'units.kmh': 'km/h',
        'units.mph': 'mph',
        'units.hPa': 'hPa',
        'units.km': 'km',
        'settings.theme': 'Theme',
        'settings.language': 'Language',
        'settings.units': 'Units',
        'cities.saved': 'Saved Cities',
        'cities.noSaved': 'No saved cities',
        'cities.remove': 'Remove',
        'errors.networkError': 'Network error. Please check your connection.',
        'errors.locationError': 'Unable to get your location. Please search for a city.',
        'errors.apiError': 'Weather service temporarily unavailable. Please try again later.'
      }
      return translations[key] || key
    },
    i18n: {
      changeLanguage: jest.fn(),
      language: 'en',
      exists: jest.fn().mockReturnValue(true)
    }
  })
}))

// Mock the api constants to avoid import.meta issues
jest.mock('../constants/api', () => ({
  API_CONFIG: {
    BASE_URL: 'https://api.openweathermap.org/data/2.5',
    API_KEY: 'test-api-key-123456789',
    ENDPOINTS: {
      CURRENT_WEATHER: '/weather',
      FORECAST: '/forecast'
    }
  },
  API_URLS: {
    currentWeather: (q, units = 'metric') => 
      `https://api.openweathermap.org/data/2.5/weather?q=${q}&appid=test-api-key-123456789&units=${units}`,
    
    currentWeatherByCoords: (lat, lon, units = 'metric') => 
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=test-api-key-123456789&units=${units}`,
    
    forecastByCoords: (lat, lon, units = 'metric') => 
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=test-api-key-123456789&units=${units}`,
    
    forecast: (q, units = 'metric') => 
      `https://api.openweathermap.org/data/2.5/forecast?q=${q}&appid=test-api-key-123456789&units=${units}`
  },
  WEATHER_CONDITIONS: {
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
}))

// Mock localStorage with jest functions
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

// Assign to both global and window for compatibility
global.localStorage = localStorageMock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
}
global.navigator.geolocation = mockGeolocation

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Mock window.location.reload
Object.defineProperty(window, 'location', {
  value: {
    reload: jest.fn(),
  },
  writable: true,
})

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks()
  // Reset localStorage mock functions
  localStorageMock.getItem.mockClear()
  localStorageMock.setItem.mockClear()
  localStorageMock.removeItem.mockClear()
  localStorageMock.clear.mockClear()
  // Reset localStorage state
  localStorageMock.clear()
  mockGeolocation.getCurrentPosition.mockClear()
}) 