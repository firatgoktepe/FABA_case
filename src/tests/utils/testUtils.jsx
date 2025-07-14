import React from 'react'
import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '../../contexts/ThemeContext'
import { LanguageProvider } from '../../contexts/LanguageContext'
import { WeatherProvider } from '../../contexts/WeatherContext'

// Mock i18n configuration
jest.mock('../../i18n/config', () => ({
  i18n: {
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
    changeLanguage: jest.fn(),
    language: 'en',
    exists: jest.fn().mockReturnValue(true)
  }
}))

// Create a custom render function that includes providers
export const renderWithProviders = (ui, options = {}) => {
  const {
    initialEntries = ['/'],
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          cacheTime: 0,
        },
      },
    }),
    ...renderOptions
  } = options

  const AllTheProviders = ({ children }) => {
    return (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <LanguageProvider>
              <WeatherProvider>
                {children}
              </WeatherProvider>
            </LanguageProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    )
  }

  return render(ui, { wrapper: AllTheProviders, ...renderOptions })
}

// Mock weather service responses
export const mockWeatherData = {
  current: {
    id: 1,
    name: 'New York',
    country: 'US',
    coordinates: { lat: 40.7128, lon: -74.0060 },
    weather: { main: 'Clear', description: 'clear sky', icon: '01d' },
    temperature: { current: 22, feelsLike: 24, min: 18, max: 26 },
    details: { humidity: 60, pressure: 1013, windSpeed: 5, visibility: 10 },
    sun: {
      sunrise: new Date('2024-01-15T07:00:00'),
      sunset: new Date('2024-01-15T18:00:00')
    }
  },
  forecast: {
    daily: [
      {
        date: new Date('2024-01-15'),
        temperature: { min: 18, max: 26, day: 22 },
        weather: { main: 'Clear', description: 'clear sky', icon: '01d' },
        humidity: 60,
        windSpeed: 5,
        pop: 0.1
      },
      {
        date: new Date('2024-01-16'),
        temperature: { min: 16, max: 24, day: 20 },
        weather: { main: 'Clouds', description: 'few clouds', icon: '02d' },
        humidity: 65,
        windSpeed: 7,
        pop: 0.3
      }
    ]
  }
}

// Helper function to create mock implementations
export const createMockWeatherService = () => ({
  fetchCurrentWeatherByCoords: jest.fn(),
  fetchForecast: jest.fn(),
  fetchCurrentWeather: jest.fn(),
})

// Helper to mock successful API responses
export const mockSuccessfulApiResponses = (weatherService) => {
  weatherService.fetchCurrentWeatherByCoords.mockResolvedValue(mockWeatherData.current)
  weatherService.fetchForecast.mockResolvedValue(mockWeatherData.forecast)
  weatherService.fetchCurrentWeather.mockResolvedValue(mockWeatherData.current)
}

// Helper to mock API errors
export const mockApiErrors = (weatherService) => {
  const error = new Error('API Error')
  weatherService.fetchCurrentWeatherByCoords.mockRejectedValue(error)
  weatherService.fetchForecast.mockRejectedValue(error)
  weatherService.fetchCurrentWeather.mockRejectedValue(error)
}

// Mock translation function
export const createMockTranslation = () => {
  return jest.fn((key, options) => {
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
  })
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
export { renderWithProviders as render } 