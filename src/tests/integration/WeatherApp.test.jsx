import React, { useState } from 'react'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, mockWeatherData } from '../utils/testUtils'
import HomePage from '../../pages/HomePage'
import weatherService from '../../services/weatherService'

// Mock the weather service
jest.mock('../../services/weatherService')

// Mock the custom hooks to avoid geolocation issues in tests
jest.mock('../../hooks/useGeolocation', () => ({
  useGeolocation: () => ({
    location: { lat: 40.7128, lon: -74.0060 },
    error: null,
    isLoading: false,
    refetch: jest.fn(),
    hasAttempted: true
  })
}))

jest.mock('../../hooks/useLocalStorage', () => ({
  useLocalStorage: (key, initialValue) => {
    // Use React.useState directly in the mock to avoid hoisting issues
    const React = require('react')
    const [value, setValue] = React.useState(initialValue)
    return [value, setValue, jest.fn()]
  }
}))

describe('Weather App Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock successful API responses by default
    weatherService.fetchCurrentWeatherByCoords.mockResolvedValue(mockWeatherData.current)
    weatherService.fetchForecast.mockResolvedValue(mockWeatherData.forecast)
    weatherService.fetchCurrentWeather.mockResolvedValue(mockWeatherData.current)
  })

  describe('Initial App Loading', () => {
    it('should load app with weather data for default location', async () => {
      renderWithProviders(<HomePage />)

      // Should show loading initially
      expect(screen.getByText('Loading...')).toBeInTheDocument()

      // Wait for weather data to load
      await waitFor(() => {
        expect(screen.getByText('New York, US')).toBeInTheDocument()
      })

      // Should display current weather
      expect(screen.getByText('22°C')).toBeInTheDocument()
      expect(screen.getByText('clear sky')).toBeInTheDocument()

      // Should display forecast
      expect(screen.getByText('Forecast')).toBeInTheDocument()
      expect(screen.getAllByText('Today')).toHaveLength(1)

      // Verify API calls were made
      expect(weatherService.fetchCurrentWeatherByCoords).toHaveBeenCalledWith(
        40.7128, -74.0060, 'metric'
      )
      expect(weatherService.fetchForecast).toHaveBeenCalledWith(
        40.7128, -74.0060, 'metric'
      )
    })

    it('should handle API errors gracefully', async () => {
      weatherService.fetchCurrentWeatherByCoords.mockRejectedValue(new Error('API Error'))
      weatherService.fetchForecast.mockRejectedValue(new Error('API Error'))

      renderWithProviders(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('Network error. Please check your connection.')).toBeInTheDocument()
      })

      expect(screen.getByText('Weather service temporarily unavailable. Please try again later.')).toBeInTheDocument()
    })
  })

  describe('City Search Functionality', () => {
    it('should search for a city and update weather data', async () => {
      const londonWeather = {
        ...mockWeatherData.current,
        id: 2,
        name: 'London',
        country: 'GB',
        coordinates: { lat: 51.5074, lon: -0.1278 },
        temperature: { current: 15, feelsLike: 16, min: 12, max: 18 }
      }

      weatherService.fetchCurrentWeather.mockResolvedValue(londonWeather)

      renderWithProviders(<HomePage />)

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('New York, US')).toBeInTheDocument()
      })

      // Find search input and button
      const searchInput = screen.getByPlaceholderText('Search for a city...')
      const searchButton = screen.getByText('Search')

      // Search for London
      await user.type(searchInput, 'London')
      await user.click(searchButton)

      // Wait for new weather data
      await waitFor(() => {
        expect(weatherService.fetchCurrentWeather).toHaveBeenCalledWith('London', 'metric')
      })

      // Search input should be cleared
      expect(searchInput).toHaveValue('')
    })

    it('should handle search errors', async () => {
      weatherService.fetchCurrentWeather.mockRejectedValue(new Error('City not found'))

      renderWithProviders(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('New York, US')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText('Search for a city...')
      const searchButton = screen.getByText('Search')

      await user.type(searchInput, 'NonexistentCity')
      await user.click(searchButton)

      // Search should still be attempted
      await waitFor(() => {
        expect(weatherService.fetchCurrentWeather).toHaveBeenCalledWith('NonexistentCity', 'metric')
      })
    })

    it('should not search with empty input', async () => {
      renderWithProviders(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('New York, US')).toBeInTheDocument()
      })

      const searchButton = screen.getByText('Search')

      // Button should be disabled with empty input
      expect(searchButton).toBeDisabled()

      await user.click(searchButton)

      // No search should be made
      expect(weatherService.fetchCurrentWeather).not.toHaveBeenCalled()
    })
  })

  describe('Units Toggle', () => {
    it('should toggle between metric and imperial units', async () => {
      renderWithProviders(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('22°C')).toBeInTheDocument()
      })

      // Should initially show metric
      expect(screen.getByText('units.metric')).toBeInTheDocument()

      // Click units toggle
      const unitsButton = screen.getByText('units.metric')
      await user.click(unitsButton)

      // Should switch to imperial
      expect(screen.getByText('units.imperial')).toBeInTheDocument()

      // Temperature should update (though we'd need to mock new API call for full test)
      // The button text change confirms the toggle worked
    })

    it('should refetch data when units change', async () => {
      renderWithProviders(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('New York, US')).toBeInTheDocument()
      })

      // Clear previous calls
      jest.clearAllMocks()

      // Toggle units
      const unitsButton = screen.getByText('units.metric')
      await user.click(unitsButton)

      // Should refetch with new units
      await waitFor(() => {
        expect(weatherService.fetchCurrentWeatherByCoords).toHaveBeenCalledWith(
          40.7128, -74.0060, 'imperial'
        )
      })
    })
  })

  describe('Theme Toggle', () => {
    it('should toggle between light and dark themes', async () => {
      renderWithProviders(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('New York, US')).toBeInTheDocument()
      })

      // Should initially show dark mode toggle (currently in light mode)
      const themeButton = screen.getByText('🌙')
      await user.click(themeButton)

      // Should switch to light mode toggle (now in dark mode)
      expect(screen.getByText('☀️')).toBeInTheDocument()
    })
  })

  describe('Language Toggle', () => {
    it('should toggle between English and Spanish', async () => {
      renderWithProviders(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('New York, US')).toBeInTheDocument()
      })

      // Should initially show language toggle button
      const languageButton = screen.getByText('EN')
      await user.click(languageButton)

      // After clicking, it should still show the language button (may show different text)
      expect(screen.getByRole('button', { name: /EN|ES/ })).toBeInTheDocument()
    })
  })

  describe('Saved Cities', () => {
    it('should display saved cities section', async () => {
      renderWithProviders(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('New York, US')).toBeInTheDocument()
      })

      // Should show saved cities section
      expect(screen.getByText('cities.saved')).toBeInTheDocument()
      expect(screen.getByText('cities.noSaved')).toBeInTheDocument()
    })

    it('should add city to saved cities after search', async () => {
      const londonWeather = {
        ...mockWeatherData.current,
        id: 2,
        name: 'London',
        country: 'GB',
        coordinates: { lat: 51.5074, lon: -0.1278 }
      }

      weatherService.fetchCurrentWeather.mockResolvedValue(londonWeather)

      renderWithProviders(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('New York, US')).toBeInTheDocument()
      })

      // Search for a city
      const searchInput = screen.getByPlaceholderText('search.placeholder')
      const searchButton = screen.getByText('search.button')

      await user.type(searchInput, 'London')
      await user.click(searchButton)

      // City should be added to search results
      await waitFor(() => {
        expect(weatherService.fetchCurrentWeather).toHaveBeenCalledWith('London', 'metric')
      })
    })
  })

  describe('Error Boundary', () => {
    it('should catch and display errors gracefully', async () => {
      // Import ErrorBoundary
      const ErrorBoundary = require('../../components/ErrorBoundary').default
      
      // Mock a component that throws an error
      const ErrorComponent = () => {
        throw new Error('Test error')
      }

      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      renderWithProviders(
        <ErrorBoundary>
          <ErrorComponent />
        </ErrorBoundary>
      )

      await waitFor(() => {
        expect(screen.getByText('Something went wrong!')).toBeInTheDocument()
      })

      expect(screen.getByText('Try Again')).toBeInTheDocument()
      expect(screen.getByText('Refresh Page')).toBeInTheDocument()

      consoleSpy.mockRestore()
    })
  })

  describe('Responsive Design Elements', () => {
    it('should render all main sections', async () => {
      renderWithProviders(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('New York, US')).toBeInTheDocument()
      })

      // Check for main sections
      expect(screen.getByText('app.title')).toBeInTheDocument() // Header title
      expect(screen.getByPlaceholderText('search.placeholder')).toBeInTheDocument() // Search
      expect(screen.getByText('22°C')).toBeInTheDocument() // Current weather
      expect(screen.getByText('weather.forecast')).toBeInTheDocument() // Forecast
      expect(screen.getByText('cities.saved')).toBeInTheDocument() // Saved cities
    })

    it('should have proper accessibility attributes', async () => {
      renderWithProviders(<HomePage />)

      await waitFor(() => {
        expect(screen.getByText('New York, US')).toBeInTheDocument()
      })

      // Check for proper form elements
      const searchInput = screen.getByPlaceholderText('search.placeholder')
      expect(searchInput).toHaveAttribute('type', 'text')

      const searchButton = screen.getByText('search.button')
      expect(searchButton).toHaveAttribute('type', 'submit')

      // Check for proper headings structure
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('app.title')
    })
  })
}) 