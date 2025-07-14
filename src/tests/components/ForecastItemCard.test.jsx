import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithProviders, createMockTranslation } from '../utils/testUtils'
import ForecastItemCard from '../../components/ForecastItemCard'
import { useLanguage } from '../../contexts/LanguageContext'
import { useWeather } from '../../contexts/WeatherContext'
import { useWeatherFormatting } from '../../hooks/useWeatherFormatting'

// Mock the hooks
jest.mock('../../contexts/LanguageContext')
jest.mock('../../contexts/WeatherContext')
jest.mock('../../hooks/useWeatherFormatting')

describe('ForecastItemCard', () => {
  const mockT = createMockTranslation()
  const mockFormatters = {
    formatForecastDate: jest.fn(),
    getWeatherIconUrl: jest.fn(),
    formatPrecipitation: jest.fn()
  }

  const mockDay = {
    date: new Date('2024-01-15'),
    temperature: { min: 18, max: 26, day: 22 },
    weather: { main: 'Clear', description: 'clear sky', icon: '01d' },
    humidity: 60,
    windSpeed: 5,
    pop: 0.3
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    useLanguage.mockReturnValue({ t: mockT })
    useWeather.mockReturnValue({ isMetric: true })
    useWeatherFormatting.mockReturnValue(mockFormatters)
    
    mockFormatters.formatForecastDate.mockReturnValue('Today')
    mockFormatters.getWeatherIconUrl.mockReturnValue('https://openweathermap.org/img/wn/01d@2x.png')
    mockFormatters.formatPrecipitation.mockReturnValue(30)
  })

  describe('Rendering', () => {
    it('should render forecast item card with all data', () => {
      renderWithProviders(<ForecastItemCard day={mockDay} index={0} />)

      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('clear sky')).toBeInTheDocument()
      expect(screen.getByText('High: 26°C')).toBeInTheDocument()
      expect(screen.getByText('Low: 18°C')).toBeInTheDocument()
      expect(screen.getByText('Humidity: 60%')).toBeInTheDocument()
      expect(screen.getByText('Wind Speed: 5 km/h')).toBeInTheDocument()
      expect(screen.getByText('Rain: 30%')).toBeInTheDocument()
    })

    it('should render weather icon with correct attributes', () => {
      renderWithProviders(<ForecastItemCard day={mockDay} index={0} />)

      const icon = screen.getByAltText('clear sky')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('src', 'https://openweathermap.org/img/wn/01d@2x.png')
      expect(icon).toHaveClass('forecast-icon')
    })

    it('should not render rain percentage when formatPrecipitation returns null', () => {
      mockFormatters.formatPrecipitation.mockReturnValue(null)

      renderWithProviders(<ForecastItemCard day={mockDay} index={0} />)

      expect(screen.queryByText(/Rain:/)).not.toBeInTheDocument()
    })
  })

  describe('Formatter Integration', () => {
    it('should call formatForecastDate with correct parameters', () => {
      renderWithProviders(<ForecastItemCard day={mockDay} index={1} />)

      expect(mockFormatters.formatForecastDate).toHaveBeenCalledWith(mockDay.date, 1)
    })

    it('should call getWeatherIconUrl with correct icon code', () => {
      renderWithProviders(<ForecastItemCard day={mockDay} index={0} />)

      expect(mockFormatters.getWeatherIconUrl).toHaveBeenCalledWith('01d')
    })

    it('should call formatPrecipitation with correct pop value', () => {
      renderWithProviders(<ForecastItemCard day={mockDay} index={0} />)

      expect(mockFormatters.formatPrecipitation).toHaveBeenCalledWith(0.3)
    })
  })

  describe('Units Display', () => {
    it('should display metric units when isMetric is true', () => {
      useWeather.mockReturnValue({ isMetric: true })

      renderWithProviders(<ForecastItemCard day={mockDay} index={0} />)

      expect(screen.getByText('High: 26°C')).toBeInTheDocument()
      expect(screen.getByText('Low: 18°C')).toBeInTheDocument()
      expect(screen.getByText('Wind Speed: 5 km/h')).toBeInTheDocument()
    })

    it('should display imperial units when isMetric is false', () => {
      useWeather.mockReturnValue({ isMetric: false })

      renderWithProviders(<ForecastItemCard day={mockDay} index={0} />)

      expect(screen.getByText('High: 26°F')).toBeInTheDocument()
      expect(screen.getByText('Low: 18°F')).toBeInTheDocument()
      expect(screen.getByText('Wind Speed: 5 mph')).toBeInTheDocument()
    })
  })

  describe('Translation Integration', () => {
    it('should use translation keys for labels', () => {
      renderWithProviders(<ForecastItemCard day={mockDay} index={0} />)

      expect(mockT).toHaveBeenCalledWith('weather.high')
      expect(mockT).toHaveBeenCalledWith('weather.low')
      expect(mockT).toHaveBeenCalledWith('weather.humidity')
      expect(mockT).toHaveBeenCalledWith('weather.windSpeed')
      expect(mockT).toHaveBeenCalledWith('units.kmh')
      expect(mockT).toHaveBeenCalledWith('weather.rain')
    })

    it('should use imperial unit translations when isMetric is false', () => {
      useWeather.mockReturnValue({ isMetric: false })

      renderWithProviders(<ForecastItemCard day={mockDay} index={0} />)

      expect(mockT).toHaveBeenCalledWith('units.mph')
    })
  })

  describe('Different Weather Conditions', () => {
    it('should handle rainy weather with different icon', () => {
      const rainyDay = {
        ...mockDay,
        weather: { main: 'Rain', description: 'light rain', icon: '10d' },
        pop: 0.8
      }

      mockFormatters.getWeatherIconUrl.mockReturnValue('https://openweathermap.org/img/wn/10d@2x.png')
      mockFormatters.formatPrecipitation.mockReturnValue(80)

      renderWithProviders(<ForecastItemCard day={rainyDay} index={1} />)

      expect(screen.getByText('light rain')).toBeInTheDocument()
      expect(screen.getByText('Rain: 80%')).toBeInTheDocument()
      expect(mockFormatters.getWeatherIconUrl).toHaveBeenCalledWith('10d')
    })

    it('should handle snowy weather', () => {
      const snowyDay = {
        ...mockDay,
        weather: { main: 'Snow', description: 'light snow', icon: '13d' },
        pop: 0.6
      }

      mockFormatters.getWeatherIconUrl.mockReturnValue('https://openweathermap.org/img/wn/13d@2x.png')
      mockFormatters.formatPrecipitation.mockReturnValue(60)

      renderWithProviders(<ForecastItemCard day={snowyDay} index={2} />)

      expect(screen.getByText('light snow')).toBeInTheDocument()
      expect(mockFormatters.getWeatherIconUrl).toHaveBeenCalledWith('13d')
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero precipitation', () => {
      const dryDay = { ...mockDay, pop: 0 }
      mockFormatters.formatPrecipitation.mockReturnValue(null)

      renderWithProviders(<ForecastItemCard day={dryDay} index={0} />)

      expect(screen.queryByText(/Rain:/)).not.toBeInTheDocument()
    })

    it('should handle extreme temperatures', () => {
      const extremeDay = {
        ...mockDay,
        temperature: { min: -20, max: 45, day: 12 }
      }

      renderWithProviders(<ForecastItemCard day={extremeDay} index={0} />)

      expect(screen.getByText('High: 45°C')).toBeInTheDocument()
      expect(screen.getByText('Low: -20°C')).toBeInTheDocument()
    })

    it('should handle high wind speeds', () => {
      const windyDay = { ...mockDay, windSpeed: 25 }

      renderWithProviders(<ForecastItemCard day={windyDay} index={0} />)

      expect(screen.getByText('Wind Speed: 25 km/h')).toBeInTheDocument()
    })

    it('should handle 100% humidity', () => {
      const humidDay = { ...mockDay, humidity: 100 }

      renderWithProviders(<ForecastItemCard day={humidDay} index={0} />)

      expect(screen.getByText('Humidity: 100%')).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('should have correct CSS classes', () => {
      const { container } = renderWithProviders(<ForecastItemCard day={mockDay} index={0} />)

      expect(container.querySelector('.forecast-item')).toBeInTheDocument()
      expect(container.querySelector('.forecast-date')).toBeInTheDocument()
      expect(container.querySelector('.forecast-weather')).toBeInTheDocument()
      expect(container.querySelector('.forecast-temps')).toBeInTheDocument()
      expect(container.querySelector('.forecast-details')).toBeInTheDocument()
    })

    it('should render all forecast details sections', () => {
      const { container } = renderWithProviders(<ForecastItemCard day={mockDay} index={0} />)

      const detailItems = container.querySelectorAll('.detail-item')
      expect(detailItems).toHaveLength(3) // humidity, wind, rain
    })
  })
}) 