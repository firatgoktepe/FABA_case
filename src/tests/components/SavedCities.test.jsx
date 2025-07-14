import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders, createMockTranslation } from '../utils/testUtils'
import SavedCities from '../../components/SavedCities'
import { useWeather } from '../../contexts/WeatherContext'
import { useLanguage } from '../../contexts/LanguageContext'

// Mock only the hook functions, keep providers intact
jest.mock('../../contexts/WeatherContext', () => {
  const actual = jest.requireActual('../../contexts/WeatherContext')
  return {
    __esModule: true,
    ...actual,
    useWeather: jest.fn()
  }
})

jest.mock('../../contexts/LanguageContext', () => {
  const actual = jest.requireActual('../../contexts/LanguageContext')
  return {
    __esModule: true,
    ...actual,
    useLanguage: jest.fn()
  }
})

describe('SavedCities', () => {
  const mockT = createMockTranslation()
  const mockRemoveSavedCity = jest.fn()
  const mockUpdateCurrentLocation = jest.fn()

  const mockSavedCities = [
    {
      id: 1,
      name: 'New York',
      country: 'US',
      coordinates: { lat: 40.7128, lon: -74.0060 },
      temperature: { current: 22 }
    },
    {
      id: 2,
      name: 'London',
      country: 'GB',
      coordinates: { lat: 51.5074, lon: -0.1278 },
      temperature: { current: 18 }
    },
    {
      id: 3,
      name: 'Tokyo',
      country: 'JP',
      coordinates: { lat: 35.6762, lon: 139.6503 },
      temperature: null
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    
    useLanguage.mockReturnValue({ t: mockT })
    
    useWeather.mockReturnValue({
      savedCities: mockSavedCities,
      removeSavedCity: mockRemoveSavedCity,
      updateCurrentLocation: mockUpdateCurrentLocation
    })
  })

  describe('Rendering with Saved Cities', () => {
    it('should render saved cities title', () => {
      renderWithProviders(<SavedCities />)

      expect(screen.getByText('Saved Cities')).toBeInTheDocument()
    })

    it('should render all saved cities', () => {
      renderWithProviders(<SavedCities />)

      expect(screen.getByText('New York, US')).toBeInTheDocument()
      expect(screen.getByText('London, GB')).toBeInTheDocument()
      expect(screen.getByText('Tokyo, JP')).toBeInTheDocument()
    })

    it('should render temperatures when available', () => {
      renderWithProviders(<SavedCities />)

      expect(screen.getByText('22°')).toBeInTheDocument()
      expect(screen.getByText('18°')).toBeInTheDocument()
    })

    it('should not render temperature when not available', () => {
      renderWithProviders(<SavedCities />)

      const tokyoItem = screen.getByText('Tokyo, JP').closest('.saved-city-item')
      expect(tokyoItem.querySelector('.saved-city-temp')).not.toBeInTheDocument()
    })

    it('should render remove buttons for each city', () => {
      renderWithProviders(<SavedCities />)

      const removeButtons = screen.getAllByText('✕')
      expect(removeButtons).toHaveLength(3)
    })

    it('should have correct CSS classes', () => {
      const { container } = renderWithProviders(<SavedCities />)

      expect(container.querySelector('.saved-cities')).toBeInTheDocument()
      expect(container.querySelector('.saved-cities-title')).toBeInTheDocument()
      expect(container.querySelector('.saved-cities-grid')).toBeInTheDocument()
      expect(container.querySelectorAll('.saved-city-item')).toHaveLength(3)
    })
  })

  describe('Empty State', () => {
    it('should render empty state when no saved cities', () => {
      useWeather.mockReturnValue({
        savedCities: [],
        removeSavedCity: mockRemoveSavedCity,
        updateCurrentLocation: mockUpdateCurrentLocation
      })

      renderWithProviders(<SavedCities />)

      expect(screen.getByText('Saved Cities')).toBeInTheDocument()
      expect(screen.getByText('No saved cities')).toBeInTheDocument()
      expect(screen.getByText('No saved cities').closest('.card')).toBeInTheDocument()
    })

    it('should render empty state when savedCities is null', () => {
      useWeather.mockReturnValue({
        savedCities: null,
        removeSavedCity: mockRemoveSavedCity,
        updateCurrentLocation: mockUpdateCurrentLocation
      })

      renderWithProviders(<SavedCities />)

      expect(screen.getByText('No saved cities')).toBeInTheDocument()
    })

    it('should render empty state when savedCities is undefined', () => {
      useWeather.mockReturnValue({
        savedCities: undefined,
        removeSavedCity: mockRemoveSavedCity,
        updateCurrentLocation: mockUpdateCurrentLocation
      })

      renderWithProviders(<SavedCities />)

      expect(screen.getByText('No saved cities')).toBeInTheDocument()
    })
  })

  describe('City Click Functionality', () => {
    it('should call updateCurrentLocation when city is clicked', () => {
      renderWithProviders(<SavedCities />)

      const newYorkItem = screen.getByText('New York, US').closest('.saved-city-item')
      fireEvent.click(newYorkItem)

      expect(mockUpdateCurrentLocation).toHaveBeenCalledWith({
        lat: 40.7128,
        lon: -74.0060
      })
    })

    it('should call updateCurrentLocation with correct coordinates for different cities', () => {
      renderWithProviders(<SavedCities />)

      const londonItem = screen.getByText('London, GB').closest('.saved-city-item')
      fireEvent.click(londonItem)

      expect(mockUpdateCurrentLocation).toHaveBeenCalledWith({
        lat: 51.5074,
        lon: -0.1278
      })
    })

    it('should handle multiple city clicks', () => {
      renderWithProviders(<SavedCities />)

      const newYorkItem = screen.getByText('New York, US').closest('.saved-city-item')
      const tokyoItem = screen.getByText('Tokyo, JP').closest('.saved-city-item')

      fireEvent.click(newYorkItem)
      fireEvent.click(tokyoItem)

      expect(mockUpdateCurrentLocation).toHaveBeenCalledTimes(2)
      expect(mockUpdateCurrentLocation).toHaveBeenNthCalledWith(1, {
        lat: 40.7128,
        lon: -74.0060
      })
      expect(mockUpdateCurrentLocation).toHaveBeenNthCalledWith(2, {
        lat: 35.6762,
        lon: 139.6503
      })
    })
  })

  describe('Remove City Functionality', () => {
    it('should call removeSavedCity when remove button is clicked', () => {
      renderWithProviders(<SavedCities />)

      const removeButtons = screen.getAllByText('✕')
      fireEvent.click(removeButtons[0])

      expect(mockRemoveSavedCity).toHaveBeenCalledWith(1)
    })

    it('should call removeSavedCity with correct city ID', () => {
      renderWithProviders(<SavedCities />)

      const removeButtons = screen.getAllByText('✕')
      fireEvent.click(removeButtons[1]) // London

      expect(mockRemoveSavedCity).toHaveBeenCalledWith(2)
    })

    it('should stop event propagation when remove button is clicked', () => {
      renderWithProviders(<SavedCities />)

      const removeButtons = screen.getAllByText('✕')
      fireEvent.click(removeButtons[0])

      // Should only call remove, not updateCurrentLocation
      expect(mockRemoveSavedCity).toHaveBeenCalledWith(1)
      expect(mockUpdateCurrentLocation).not.toHaveBeenCalled()
    })

    it('should have correct title attribute for remove buttons', () => {
      renderWithProviders(<SavedCities />)

      const removeButtons = screen.getAllByText('✕')
      removeButtons.forEach(button => {
        expect(button).toHaveAttribute('title', 'Remove')
      })
    })

    it('should have correct CSS class for remove buttons', () => {
      renderWithProviders(<SavedCities />)

      const removeButtons = screen.getAllByText('✕')
      removeButtons.forEach(button => {
        expect(button).toHaveClass('remove-city-btn')
      })
    })
  })

  describe('Translation Integration', () => {
    it('should use translation for saved cities title', () => {
      renderWithProviders(<SavedCities />)

      expect(mockT).toHaveBeenCalledWith('cities.saved')
    })

    it('should use translation for no saved cities message', () => {
      useWeather.mockReturnValue({
        savedCities: [],
        removeSavedCity: mockRemoveSavedCity,
        updateCurrentLocation: mockUpdateCurrentLocation
      })

      renderWithProviders(<SavedCities />)

      expect(mockT).toHaveBeenCalledWith('cities.noSaved')
    })

    it('should use translation for remove button title', () => {
      renderWithProviders(<SavedCities />)

      expect(mockT).toHaveBeenCalledWith('cities.remove')
    })
  })

  describe('Component Structure', () => {
    it('should render saved city info correctly', () => {
      const { container } = renderWithProviders(<SavedCities />)

      const savedCityInfos = container.querySelectorAll('.saved-city-info')
      expect(savedCityInfos).toHaveLength(3)

      const savedCityNames = container.querySelectorAll('.saved-city-name')
      expect(savedCityNames).toHaveLength(3)

      const savedCityTemps = container.querySelectorAll('.saved-city-temp')
      expect(savedCityTemps).toHaveLength(2) // Only NY and London have temperatures
    })

    it('should render cities in grid layout', () => {
      const { container } = renderWithProviders(<SavedCities />)

      const grid = container.querySelector('.saved-cities-grid')
      expect(grid).toBeInTheDocument()
      expect(grid.children).toHaveLength(3)
    })
  })

  describe('Edge Cases', () => {
    it('should handle city without coordinates gracefully', () => {
      const citiesWithoutCoords = [{
        id: 1,
        name: 'Invalid City',
        country: 'XX',
        coordinates: null,
        temperature: { current: 20 }
      }]

      useWeather.mockReturnValue({
        savedCities: citiesWithoutCoords,
        removeSavedCity: mockRemoveSavedCity,
        updateCurrentLocation: mockUpdateCurrentLocation
      })

      renderWithProviders(<SavedCities />)

      const cityItem = screen.getByText('Invalid City, XX').closest('.saved-city-item')
      fireEvent.click(cityItem)

      expect(mockUpdateCurrentLocation).toHaveBeenCalledWith({
        lat: null,
        lon: null
      })
    })

    it('should handle missing temperature object', () => {
      const cityWithoutTemp = [{
        id: 1,
        name: 'No Temp City',
        country: 'XX',
        coordinates: { lat: 0, lon: 0 }
        // No temperature property
      }]

      useWeather.mockReturnValue({
        savedCities: cityWithoutTemp,
        removeSavedCity: mockRemoveSavedCity,
        updateCurrentLocation: mockUpdateCurrentLocation
      })

      renderWithProviders(<SavedCities />)

      expect(screen.getByText('No Temp City, XX')).toBeInTheDocument()
      const cityItem = screen.getByText('No Temp City, XX').closest('.saved-city-item')
      expect(cityItem.querySelector('.saved-city-temp')).not.toBeInTheDocument()
    })

    it('should handle zero temperature', () => {
      const cityWithZeroTemp = [{
        id: 1,
        name: 'Freezing City',
        country: 'XX',
        coordinates: { lat: 0, lon: 0 },
        temperature: { current: 0 }
      }]

      useWeather.mockReturnValue({
        savedCities: cityWithZeroTemp,
        removeSavedCity: mockRemoveSavedCity,
        updateCurrentLocation: mockUpdateCurrentLocation
      })

      renderWithProviders(<SavedCities />)

      expect(screen.getByText('0°')).toBeInTheDocument()
    })
  })
}) 