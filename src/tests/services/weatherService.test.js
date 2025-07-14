import weatherService from '../../services/weatherService'
import { API_URLS } from '../../constants/api'

// Mock fetch globally
global.fetch = jest.fn()

describe('WeatherService', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  describe('fetchCurrentWeather', () => {
    const mockApiResponse = {
      id: 1,
      name: 'New York',
      sys: { country: 'US' },
      coord: { lat: 40.7128, lon: -74.0060 },
      weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
      main: { temp: 22, feels_like: 24, temp_min: 18, temp_max: 26, humidity: 60, pressure: 1013 },
      wind: { speed: 5, deg: 180 },
      visibility: 10000,
      sys: { country: 'US', sunrise: 1705309200, sunset: 1705346400 },
      dt: 1705327200
    }

    it('should fetch and transform current weather data successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      })

      const result = await weatherService.fetchCurrentWeather('New York', 'metric')

      expect(fetch).toHaveBeenCalledWith(API_URLS.currentWeather('New York', 'metric'))
      expect(result).toEqual({
        id: 1,
        name: 'New York',
        country: 'US',
        coordinates: { lat: 40.7128, lon: -74.0060 },
        weather: { main: 'Clear', description: 'clear sky', icon: '01d' },
        temperature: { current: 22, feelsLike: 24, min: 18, max: 26 },
        details: { humidity: 60, pressure: 1013, visibility: 10, windSpeed: 5, windDirection: 180 },
        sun: {
          sunrise: new Date(1705309200 * 1000),
          sunset: new Date(1705346400 * 1000)
        },
        timestamp: new Date(1705327200 * 1000)
      })
    })

    it('should handle 404 city not found error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      await expect(weatherService.fetchCurrentWeather('NonexistentCity')).rejects.toThrow('City not found')
    })

    it('should handle other API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await expect(weatherService.fetchCurrentWeather('New York')).rejects.toThrow('Failed to fetch weather data')
    })

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(weatherService.fetchCurrentWeather('New York')).rejects.toThrow('Network error')
    })
  })

  describe('fetchCurrentWeatherByCoords', () => {
    const mockApiResponse = {
      id: 1,
      name: 'New York',
      sys: { country: 'US' },
      coord: { lat: 40.7128, lon: -74.0060 },
      weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
      main: { temp: 22, feels_like: 24, temp_min: 18, temp_max: 26, humidity: 60, pressure: 1013 },
      wind: { speed: 5, deg: 180 },
      visibility: 10000,
      sys: { country: 'US', sunrise: 1705309200, sunset: 1705346400 },
      dt: 1705327200
    }

    it('should fetch weather by coordinates successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      })

      const result = await weatherService.fetchCurrentWeatherByCoords(40.7128, -74.0060, 'imperial')

      expect(fetch).toHaveBeenCalledWith(API_URLS.currentWeatherByCoords(40.7128, -74.0060, 'imperial'))
      expect(result.coordinates).toEqual({ lat: 40.7128, lon: -74.0060 })
    })

    it('should handle API errors for coordinates', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      })

      await expect(weatherService.fetchCurrentWeatherByCoords(999, 999)).rejects.toThrow('Failed to fetch weather data')
    })
  })

  describe('fetchForecast', () => {
    const mockForecastResponse = {
      list: [
        {
          dt: 1705327200,
          main: { temp: 22, humidity: 60, pressure: 1013 },
          weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
          wind: { speed: 5, deg: 180 },
          pop: 0.1
        },
        {
          dt: 1705413600,
          main: { temp: 20, humidity: 65, pressure: 1015 },
          weather: [{ main: 'Clouds', description: 'few clouds', icon: '02d' }],
          wind: { speed: 7, deg: 200 },
          pop: 0.3
        }
      ]
    }

    it('should fetch and transform forecast data successfully', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockForecastResponse
      })

      const result = await weatherService.fetchForecast(40.7128, -74.0060, 'metric')

      expect(fetch).toHaveBeenCalledWith(API_URLS.forecastByCoords(40.7128, -74.0060, 'metric'))
      expect(result.daily).toHaveLength(2)
      expect(result.daily[0]).toEqual({
        date: new Date(1705327200 * 1000),
        temperature: { min: 22, max: 22, day: 22 },
        humidity: 60,
        pressure: 1013,
        windSpeed: 5,
        windDirection: 180,
        weather: { main: 'Clear', description: 'clear sky', icon: '01d' },
        pop: 0.1
      })
    })

    it('should handle forecast API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      await expect(weatherService.fetchForecast(40.7128, -74.0060)).rejects.toThrow('Failed to fetch forecast data')
    })
  })

  describe('transformCurrentWeatherData', () => {
    it('should transform API response correctly', () => {
      const apiData = {
        id: 1,
        name: 'London',
        sys: { country: 'GB', sunrise: 1705309200, sunset: 1705346400 },
        coord: { lat: 51.5074, lon: -0.1278 },
        weather: [{ main: 'Rain', description: 'light rain', icon: '10d' }],
        main: { temp: 15.5, feels_like: 16.2, temp_min: 12.1, temp_max: 18.9, humidity: 75, pressure: 1008 },
        wind: { speed: 8.5, deg: 220 },
        visibility: 8000,
        dt: 1705327200
      }

      const result = weatherService.transformCurrentWeatherData(apiData)

      expect(result).toEqual({
        id: 1,
        name: 'London',
        country: 'GB',
        coordinates: { lat: 51.5074, lon: -0.1278 },
        weather: { main: 'Rain', description: 'light rain', icon: '10d' },
        temperature: { current: 16, feelsLike: 16, min: 12, max: 19 },
        details: { humidity: 75, pressure: 1008, visibility: 8, windSpeed: 8.5, windDirection: 220 },
        sun: {
          sunrise: new Date(1705309200 * 1000),
          sunset: new Date(1705346400 * 1000)
        },
        timestamp: new Date(1705327200 * 1000)
      })
    })

    it('should handle missing wind data', () => {
      const apiData = {
        id: 1,
        name: 'Test',
        sys: { country: 'US', sunrise: 1705309200, sunset: 1705346400 },
        coord: { lat: 0, lon: 0 },
        weather: [{ main: 'Clear', description: 'clear', icon: '01d' }],
        main: { temp: 20, feels_like: 20, temp_min: 20, temp_max: 20, humidity: 50, pressure: 1013 },
        dt: 1705327200
      }

      const result = weatherService.transformCurrentWeatherData(apiData)

      expect(result.details.windSpeed).toBe(0)
      expect(result.details.windDirection).toBe(0)
    })

    it('should handle missing visibility data', () => {
      const apiData = {
        id: 1,
        name: 'Test',
        sys: { country: 'US', sunrise: 1705309200, sunset: 1705346400 },
        coord: { lat: 0, lon: 0 },
        weather: [{ main: 'Clear', description: 'clear', icon: '01d' }],
        main: { temp: 20, feels_like: 20, temp_min: 20, temp_max: 20, humidity: 50, pressure: 1013 },
        wind: { speed: 5, deg: 180 },
        dt: 1705327200
      }

      const result = weatherService.transformCurrentWeatherData(apiData)

      expect(result.details.visibility).toBe(null)
    })
  })

  describe('groupForecastsByDay', () => {
    it('should group multiple forecasts by day correctly', () => {
      const forecastList = [
        {
          dt: 1705327200, // Same day
          main: { temp: 20, humidity: 60, pressure: 1013 },
          weather: [{ main: 'Clear', description: 'clear', icon: '01d' }],
          wind: { speed: 5, deg: 180 },
          pop: 0.1
        },
        {
          dt: 1705338000, // Same day, different time
          main: { temp: 25, humidity: 55, pressure: 1012 },
          weather: [{ main: 'Clear', description: 'clear', icon: '01d' }],
          wind: { speed: 6, deg: 185 },
          pop: 0.2
        },
        {
          dt: 1705413600, // Next day
          main: { temp: 18, humidity: 70, pressure: 1015 },
          weather: [{ main: 'Clouds', description: 'clouds', icon: '02d' }],
          wind: { speed: 4, deg: 170 },
          pop: 0.3
        }
      ]

      const result = weatherService.groupForecastsByDay(forecastList)

      expect(result).toHaveLength(2) // Two different days
      
      // First day should have averaged temp and highest pop
      const firstDay = result[0]
      expect(firstDay.temp).toBe(22.5) // (20 + 25) / 2
      expect(firstDay.minTemp).toBe(20)
      expect(firstDay.maxTemp).toBe(25)
      expect(firstDay.pop).toBe(0.2) // Highest pop for that day

      // Second day
      const secondDay = result[1]
      expect(secondDay.temp).toBe(18)
      expect(secondDay.minTemp).toBe(18)
      expect(secondDay.maxTemp).toBe(18)
      expect(secondDay.pop).toBe(0.3)
    })

    it('should handle single forecast correctly', () => {
      const forecastList = [
        {
          dt: 1705327200,
          main: { temp: 22, humidity: 60, pressure: 1013 },
          weather: [{ main: 'Clear', description: 'clear', icon: '01d' }],
          wind: { speed: 5, deg: 180 },
          pop: 0.1
        }
      ]

      const result = weatherService.groupForecastsByDay(forecastList)

      expect(result).toHaveLength(1)
      expect(result[0].temp).toBe(22)
      expect(result[0].minTemp).toBe(22)
      expect(result[0].maxTemp).toBe(22)
    })
  })
}) 