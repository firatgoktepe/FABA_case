import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCurrentWeather, useForecastWeather, useWeatherSearch } from '../../hooks/useWeatherData'
import weatherService from '../../services/weatherService'

// Mock the weather service
jest.mock('../../services/weatherService')

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  })
  
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useWeatherData hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useCurrentWeather', () => {
    const mockLocation = { lat: 40.7128, lon: -74.0060 }
    const mockWeatherData = {
      id: 1,
      name: 'New York',
      country: 'US',
      coordinates: mockLocation,
      weather: { main: 'Clear', description: 'clear sky', icon: '01d' },
      temperature: { current: 22, feelsLike: 24, min: 18, max: 26 },
      details: { humidity: 60, pressure: 1013, windSpeed: 5 }
    }

    it('should fetch weather data successfully', async () => {
      weatherService.fetchCurrentWeatherByCoords.mockResolvedValue(mockWeatherData)

      const { result } = renderHook(
        () => useCurrentWeather(mockLocation, 'metric'),
        { wrapper: createWrapper() }
      )

      // Initial state
      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()

      // Wait for the query to complete
      await waitFor(() => {
        expect(result.current.data).toBeDefined()
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toEqual(mockWeatherData)
      expect(result.current.error).toBe(null)
      expect(weatherService.fetchCurrentWeatherByCoords).toHaveBeenCalledWith(
        mockLocation.lat,
        mockLocation.lon,
        'metric'
      )
    })

    it('should handle API errors gracefully', async () => {
      const error = new Error('API Error')
      weatherService.fetchCurrentWeatherByCoords.mockRejectedValue(error)

      const { result } = renderHook(
        () => useCurrentWeather(mockLocation, 'metric'),
        { wrapper: createWrapper() }
      )

      // Wait for the query to show error state
      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.data).toBeUndefined()
      expect(result.current.error).toBeTruthy()
    })

    it('should not fetch when location is null', async () => {
      const { result } = renderHook(
        () => useCurrentWeather(null, 'metric'),
        { wrapper: createWrapper() }
      )

      // When location is null, query should be disabled
      // Wait a bit to let React Query stabilize
      await waitFor(() => {
        expect(result.current.isFetching).toBe(false)
      })
      
      expect(weatherService.fetchCurrentWeatherByCoords).not.toHaveBeenCalled()
      expect(result.current.data).toBeUndefined()
    })

    it('should not fetch when location is incomplete', async () => {
      const incompleteLocation = { lat: 40.7128 } // missing lon

      const { result } = renderHook(
        () => useCurrentWeather(incompleteLocation, 'metric'),
        { wrapper: createWrapper() }
      )

      // When location is incomplete, query should be disabled
      await waitFor(() => {
        expect(result.current.isFetching).toBe(false)
      })
      
      expect(weatherService.fetchCurrentWeatherByCoords).not.toHaveBeenCalled()
      expect(result.current.data).toBeUndefined()
    })

    it('should use correct query key for caching', async () => {
      weatherService.fetchCurrentWeatherByCoords.mockResolvedValue(mockWeatherData)

      const { result } = renderHook(
        () => useCurrentWeather(mockLocation, 'imperial'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(weatherService.fetchCurrentWeatherByCoords).toHaveBeenCalledWith(
        mockLocation.lat,
        mockLocation.lon,
        'imperial'
      )
    })

    it('should pass custom options to useQuery', async () => {
      weatherService.fetchCurrentWeatherByCoords.mockResolvedValue(mockWeatherData)

      const customOptions = { staleTime: 15 * 60 * 1000 }

      const { result } = renderHook(
        () => useCurrentWeather(mockLocation, 'metric', customOptions),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockWeatherData)
    })
  })

  describe('useForecastWeather', () => {
    const mockLocation = { lat: 40.7128, lon: -74.0060 }
    const mockForecastData = {
      daily: [
        {
          date: new Date('2024-01-15'),
          temperature: { min: 18, max: 26, day: 22 },
          weather: { main: 'Clear', description: 'clear sky', icon: '01d' },
          humidity: 60,
          windSpeed: 5,
          pop: 0.1
        }
      ]
    }

    it('should fetch forecast data successfully', async () => {
      weatherService.fetchForecast.mockResolvedValue(mockForecastData)

      const { result } = renderHook(
        () => useForecastWeather(mockLocation, 'metric'),
        { wrapper: createWrapper() }
      )

      // Initial state
      expect(result.current.isLoading).toBe(true)
      expect(result.current.data).toBeUndefined()

      // Wait for the query to complete
      await waitFor(() => {
        expect(result.current.data).toBeDefined()
      })

      expect(result.current.isLoading).toBe(false)
      expect(result.current.data).toEqual(mockForecastData)
      expect(result.current.error).toBe(null)
      expect(weatherService.fetchForecast).toHaveBeenCalledWith(
        mockLocation.lat,
        mockLocation.lon,
        'metric'
      )
    })

    it('should handle forecast API errors', async () => {
      const error = new Error('Forecast API Error')
      weatherService.fetchForecast.mockRejectedValue(error)

      const { result } = renderHook(
        () => useForecastWeather(mockLocation, 'metric'),
        { wrapper: createWrapper() }
      )

      // Wait for the query to show error state
      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.data).toBeUndefined()
      expect(result.current.error).toBeTruthy()
    })

    it('should not fetch when location is invalid', async () => {
      const { result } = renderHook(
        () => useForecastWeather(null, 'metric'),
        { wrapper: createWrapper() }
      )

      // When location is invalid, query should be disabled
      await waitFor(() => {
        expect(result.current.isFetching).toBe(false)
      })
      
      expect(weatherService.fetchForecast).not.toHaveBeenCalled()
      expect(result.current.data).toBeUndefined()
    })

    it('should use different stale time than current weather', async () => {
      weatherService.fetchForecast.mockResolvedValue(mockForecastData)

      const { result } = renderHook(
        () => useForecastWeather(mockLocation, 'metric'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.data).toEqual(mockForecastData)
    })
  })

  describe('useWeatherSearch', () => {
    const mockSearchResult = {
      id: 1,
      name: 'London',
      country: 'GB',
      coordinates: { lat: 51.5074, lon: -0.1278 },
      weather: { main: 'Clouds', description: 'few clouds', icon: '02d' },
      temperature: { current: 15, feelsLike: 16, min: 12, max: 18 }
    }

    it('should search for weather successfully', async () => {
      weatherService.fetchCurrentWeather.mockResolvedValue(mockSearchResult)

      const { result } = renderHook(
        () => useWeatherSearch('metric'),
        { wrapper: createWrapper() }
      )

      // Initial state
      expect(result.current.isLoading).toBe(false)
      expect(typeof result.current.searchWeather).toBe('function')

      // Start the search
      const searchPromise = result.current.searchWeather('London')

      // Wait for the mutation to complete
      const searchResult = await searchPromise

      expect(searchResult).toEqual(mockSearchResult)
      expect(weatherService.fetchCurrentWeather).toHaveBeenCalledWith('London', 'metric')
    })

    it('should handle search errors', async () => {
      const error = new Error('Search API Error')
      weatherService.fetchCurrentWeather.mockRejectedValue(error)

      const { result } = renderHook(
        () => useWeatherSearch('metric'),
        { wrapper: createWrapper() }
      )

      // Initial state
      expect(result.current.isLoading).toBe(false)

      // Attempt the search
      await expect(result.current.searchWeather('Invalid City')).rejects.toThrow('Search API Error')
      expect(weatherService.fetchCurrentWeather).toHaveBeenCalledWith('Invalid City', 'metric')
    })
  })

  describe('Integration with different units', () => {
    const mockLocation = { lat: 40.7128, lon: -74.0060 }

    it('should pass imperial units correctly', async () => {
      const mockData = { temperature: { current: 72 } }
      weatherService.fetchCurrentWeatherByCoords.mockResolvedValue(mockData)

      const { result } = renderHook(
        () => useCurrentWeather(mockLocation, 'imperial'),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(weatherService.fetchCurrentWeatherByCoords).toHaveBeenCalledWith(
        mockLocation.lat,
        mockLocation.lon,
        'imperial'
      )
    })

    it('should default to metric when units not specified', async () => {
      const mockData = { temperature: { current: 22 } }
      weatherService.fetchCurrentWeatherByCoords.mockResolvedValue(mockData)

      const { result } = renderHook(
        () => useCurrentWeather(mockLocation),
        { wrapper: createWrapper() }
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(weatherService.fetchCurrentWeatherByCoords).toHaveBeenCalledWith(
        mockLocation.lat,
        mockLocation.lon,
        'metric'
      )
    })
  })
}) 