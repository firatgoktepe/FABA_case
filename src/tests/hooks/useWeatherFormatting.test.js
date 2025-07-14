import { renderHook } from '@testing-library/react'
import { useWeatherFormatting } from '../../hooks/useWeatherFormatting'
import { useLanguage } from '../../contexts/LanguageContext'

// Provide a manual mock for LanguageContext to avoid loading i18n configuration
jest.mock('../../contexts/LanguageContext', () => {
  return {
    __esModule: true,
    useLanguage: jest.fn()
  }
})

describe('useWeatherFormatting', () => {
  const mockT = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    useLanguage.mockReturnValue({ t: mockT })
    mockT.mockImplementation((key) => {
      const translations = {
        'weather.today': 'Today',
        'units.kmh': 'km/h',
        'units.mph': 'mph'
      }
      return translations[key] || key
    })
  })

  describe('formatTime', () => {
    it('should format time correctly', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      const date = new Date('2024-01-15T14:30:00')
      
      const formatted = result.current.formatTime(date)
      
      expect(formatted).toMatch(/\d{1,2}:\d{2}/)
    })

    it('should return empty string for invalid date', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      expect(result.current.formatTime(null)).toBe('')
      expect(result.current.formatTime(undefined)).toBe('')
      expect(result.current.formatTime('invalid')).toBe('')
    })

    it('should handle Date objects', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      const date = new Date('2024-01-15T09:05:00')
      
      const formatted = result.current.formatTime(date)
      
      expect(formatted).toBeTruthy()
      expect(typeof formatted).toBe('string')
    })
  })

  describe('formatForecastDate', () => {
    it('should return "Today" for index 0', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      const date = new Date('2024-01-15')
      
      const formatted = result.current.formatForecastDate(date, 0)
      
      expect(formatted).toBe('Today')
      expect(mockT).toHaveBeenCalledWith('weather.today')
    })

    it('should format date correctly for non-zero index', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      const date = new Date('2024-01-16')
      
      const formatted = result.current.formatForecastDate(date, 1)
      
      expect(formatted).toMatch(/\w{3}/) // Should contain day abbreviation
      expect(formatted).toBeTruthy()
    })

    it('should return empty string for invalid date', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      expect(result.current.formatForecastDate(null, 1)).toBe('')
      expect(result.current.formatForecastDate(undefined, 1)).toBe('')
    })

    it('should handle default index parameter', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      const date = new Date('2024-01-15')
      
      const formatted = result.current.formatForecastDate(date)
      
      expect(formatted).toBe('Today')
    })
  })

  describe('getWeatherIconUrl', () => {
    it('should generate correct icon URL with default size', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      const url = result.current.getWeatherIconUrl('01d')
      
      expect(url).toBe('https://openweathermap.org/img/wn/01d@2x.png')
    })

    it('should generate correct icon URL with custom size', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      const url = result.current.getWeatherIconUrl('01d', '4x')
      
      expect(url).toBe('https://openweathermap.org/img/wn/01d@4x.png')
    })

    it('should return empty string for invalid icon code', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      expect(result.current.getWeatherIconUrl(null)).toBe('')
      expect(result.current.getWeatherIconUrl(undefined)).toBe('')
      expect(result.current.getWeatherIconUrl('')).toBe('')
    })

    it('should handle various icon codes', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      const iconCodes = ['01d', '02n', '03d', '04n', '09d', '10n', '11d', '13n', '50d']
      
      iconCodes.forEach(code => {
        const url = result.current.getWeatherIconUrl(code)
        expect(url).toBe(`https://openweathermap.org/img/wn/${code}@2x.png`)
      })
    })
  })

  describe('formatPrecipitation', () => {
    it('should return rounded percentage for valid pop', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      expect(result.current.formatPrecipitation(0.75)).toBe(75)
      expect(result.current.formatPrecipitation(0.1)).toBe(10)
      expect(result.current.formatPrecipitation(0.999)).toBe(100)
    })

    it('should return null for zero or negative pop', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      expect(result.current.formatPrecipitation(0)).toBe(null)
      expect(result.current.formatPrecipitation(-0.1)).toBe(null)
    })

    it('should return null for invalid pop values', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      expect(result.current.formatPrecipitation(null)).toBe(null)
      expect(result.current.formatPrecipitation(undefined)).toBe(null)
    })

    it('should handle edge cases', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      expect(result.current.formatPrecipitation(0.001)).toBe(0)
      expect(result.current.formatPrecipitation(1)).toBe(100)
    })
  })

  describe('formatTemperature', () => {
    it('should format temperature with metric units', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      expect(result.current.formatTemperature(25.7, true)).toBe('26°C')
      expect(result.current.formatTemperature(-5.2, true)).toBe('-5°C')
    })

    it('should format temperature with imperial units', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      expect(result.current.formatTemperature(77.8, false)).toBe('78°F')
      expect(result.current.formatTemperature(32.1, false)).toBe('32°F')
    })

    it('should handle zero temperature', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      expect(result.current.formatTemperature(0, true)).toBe('0°C')
      expect(result.current.formatTemperature(0, false)).toBe('0°F')
    })

    it('should return empty string for invalid temperature', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      expect(result.current.formatTemperature(null, true)).toBe('')
      expect(result.current.formatTemperature(undefined, false)).toBe('')
    })

    it('should default to metric when isMetric not specified', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      expect(result.current.formatTemperature(25)).toBe('25°C')
    })
  })

  describe('formatWindSpeed', () => {
    it('should format wind speed with metric units', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      const formatted = result.current.formatWindSpeed(15.5, true)
      
      expect(formatted).toBe('15.5 km/h')
      expect(mockT).toHaveBeenCalledWith('units.kmh')
    })

    it('should format wind speed with imperial units', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      const formatted = result.current.formatWindSpeed(10.2, false)
      
      expect(formatted).toBe('10.2 mph')
      expect(mockT).toHaveBeenCalledWith('units.mph')
    })

    it('should handle zero wind speed', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      expect(result.current.formatWindSpeed(0, true)).toBe('0 km/h')
    })

    it('should return empty string for invalid wind speed', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      expect(result.current.formatWindSpeed(null, true)).toBe('')
      expect(result.current.formatWindSpeed(undefined, false)).toBe('')
    })

    it('should default to metric when isMetric not specified', () => {
      const { result } = renderHook(() => useWeatherFormatting())
      
      const formatted = result.current.formatWindSpeed(12)
      
      expect(formatted).toBe('12 km/h')
    })
  })

  describe('Memoization', () => {
    it('should memoize formatters to prevent recreation', () => {
      const { result, rerender } = renderHook(() => useWeatherFormatting())
      
      const firstFormatters = result.current
      
      // Rerender without changing dependencies
      rerender()
      
      const secondFormatters = result.current
      
      expect(firstFormatters).toBe(secondFormatters)
    })

    it('should recreate formatters when translation function changes', () => {
      const { result, rerender } = renderHook(() => useWeatherFormatting())
      
      const firstFormatters = result.current
      
      // Change the mock translation function
      const newMockT = jest.fn()
      useLanguage.mockReturnValue({ t: newMockT })
      
      rerender()
      
      const secondFormatters = result.current
      
      expect(firstFormatters).not.toBe(secondFormatters)
    })
  })
}) 