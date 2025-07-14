import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders, createMockTranslation } from '../utils/testUtils'
import Header from '../../components/Header'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useWeather } from '../../contexts/WeatherContext'

// Mock the contexts
jest.mock('../../contexts/ThemeContext')
jest.mock('../../contexts/LanguageContext')
jest.mock('../../contexts/WeatherContext')

describe('Header', () => {
  const mockT = createMockTranslation()
  const mockToggleTheme = jest.fn()
  const mockChangeLanguage = jest.fn()
  const mockToggleUnits = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    useTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
      isDark: false
    })
    
    useLanguage.mockReturnValue({
      t: mockT,
      changeLanguage: mockChangeLanguage,
      currentLanguage: 'en',
      isEnglish: true
    })
    
    useWeather.mockReturnValue({
      units: 'metric',
      toggleUnits: mockToggleUnits,
      isMetric: true
    })
  })

  describe('Rendering', () => {
    it('should render header with title and controls', () => {
      renderWithProviders(<Header />)

      expect(screen.getByText('Weather Forecast')).toBeInTheDocument()
      expect(screen.getByText('Metric')).toBeInTheDocument()
      expect(screen.getByText('ES')).toBeInTheDocument()
      expect(screen.getByText('🌙')).toBeInTheDocument()
    })

    it('should have correct CSS classes', () => {
      const { container } = renderWithProviders(<Header />)

      expect(container.querySelector('.header')).toBeInTheDocument()
      expect(container.querySelector('.container')).toBeInTheDocument()
      expect(container.querySelector('.header-content')).toBeInTheDocument()
      expect(container.querySelector('.header-title')).toBeInTheDocument()
      expect(container.querySelector('.header-controls')).toBeInTheDocument()
    })

    it('should render all control buttons', () => {
      renderWithProviders(<Header />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(3)
    })
  })

  describe('Units Toggle', () => {
    it('should display metric units when isMetric is true', () => {
      useWeather.mockReturnValue({
        units: 'metric',
        toggleUnits: mockToggleUnits,
        isMetric: true
      })

      renderWithProviders(<Header />)

      expect(screen.getByText('Metric')).toBeInTheDocument()
    })

    it('should display imperial units when isMetric is false', () => {
      useWeather.mockReturnValue({
        units: 'imperial',
        toggleUnits: mockToggleUnits,
        isMetric: false
      })

      renderWithProviders(<Header />)

      expect(screen.getByText('Imperial')).toBeInTheDocument()
    })

    it('should call toggleUnits when units button is clicked', () => {
      renderWithProviders(<Header />)

      const unitsButton = screen.getByText('Metric')
      fireEvent.click(unitsButton)

      expect(mockToggleUnits).toHaveBeenCalledTimes(1)
    })

    it('should have correct title attribute for units button', () => {
      renderWithProviders(<Header />)

      const unitsButton = screen.getByText('Metric')
      expect(unitsButton).toHaveAttribute('title', 'Units')
    })
  })

  describe('Language Toggle', () => {
    it('should display ES when current language is English', () => {
      useLanguage.mockReturnValue({
        t: mockT,
        changeLanguage: mockChangeLanguage,
        currentLanguage: 'en',
        isEnglish: true
      })

      renderWithProviders(<Header />)

      expect(screen.getByText('ES')).toBeInTheDocument()
    })

    it('should display EN when current language is Spanish', () => {
      useLanguage.mockReturnValue({
        t: mockT,
        changeLanguage: mockChangeLanguage,
        currentLanguage: 'es',
        isEnglish: false
      })

      renderWithProviders(<Header />)

      expect(screen.getByText('EN')).toBeInTheDocument()
    })

    it('should call changeLanguage with correct parameter when language button is clicked', () => {
      renderWithProviders(<Header />)

      const languageButton = screen.getByText('ES')
      fireEvent.click(languageButton)

      expect(mockChangeLanguage).toHaveBeenCalledWith('es')
    })

    it('should call changeLanguage with en when current language is Spanish', () => {
      useLanguage.mockReturnValue({
        t: mockT,
        changeLanguage: mockChangeLanguage,
        currentLanguage: 'es',
        isEnglish: false
      })

      renderWithProviders(<Header />)

      const languageButton = screen.getByText('EN')
      fireEvent.click(languageButton)

      expect(mockChangeLanguage).toHaveBeenCalledWith('en')
    })

    it('should have correct title attribute for language button', () => {
      renderWithProviders(<Header />)

      const languageButton = screen.getByText('ES')
      expect(languageButton).toHaveAttribute('title', 'Language')
    })
  })

  describe('Theme Toggle', () => {
    it('should display moon icon when theme is light', () => {
      useTheme.mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
        isDark: false
      })

      renderWithProviders(<Header />)

      expect(screen.getByText('🌙')).toBeInTheDocument()
    })

    it('should display sun icon when theme is dark', () => {
      useTheme.mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        isDark: true
      })

      renderWithProviders(<Header />)

      expect(screen.getByText('☀️')).toBeInTheDocument()
    })

    it('should call toggleTheme when theme button is clicked', () => {
      renderWithProviders(<Header />)

      const themeButton = screen.getByText('🌙')
      fireEvent.click(themeButton)

      expect(mockToggleTheme).toHaveBeenCalledTimes(1)
    })

    it('should have correct title attribute for theme button', () => {
      renderWithProviders(<Header />)

      const themeButton = screen.getByText('🌙')
      expect(themeButton).toHaveAttribute('title', 'Theme')
    })
  })

  describe('Translation Integration', () => {
    it('should use translation for app title', () => {
      renderWithProviders(<Header />)

      expect(mockT).toHaveBeenCalledWith('app.title')
    })

    it('should use translation for settings labels', () => {
      renderWithProviders(<Header />)

      expect(mockT).toHaveBeenCalledWith('settings.units')
      expect(mockT).toHaveBeenCalledWith('settings.language')
      expect(mockT).toHaveBeenCalledWith('settings.theme')
    })

    it('should use translation for unit labels', () => {
      renderWithProviders(<Header />)

      expect(mockT).toHaveBeenCalledWith('units.metric')
    })

    it('should use imperial translation when isMetric is false', () => {
      useWeather.mockReturnValue({
        units: 'imperial',
        toggleUnits: mockToggleUnits,
        isMetric: false
      })

      renderWithProviders(<Header />)

      expect(mockT).toHaveBeenCalledWith('units.imperial')
    })
  })

  describe('Button Styling', () => {
    it('should have correct CSS classes for buttons', () => {
      renderWithProviders(<Header />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveClass('btn', 'btn-secondary')
      })
    })
  })

  describe('Event Handling', () => {
    it('should handle multiple rapid clicks correctly', () => {
      renderWithProviders(<Header />)

      const themeButton = screen.getByText('🌙')
      
      fireEvent.click(themeButton)
      fireEvent.click(themeButton)
      fireEvent.click(themeButton)

      expect(mockToggleTheme).toHaveBeenCalledTimes(3)
    })

    it('should handle keyboard events on buttons', () => {
      renderWithProviders(<Header />)

      const unitsButton = screen.getByText('Metric')
      
      fireEvent.keyDown(unitsButton, { key: 'Enter', code: 'Enter' })

      // Since we're not explicitly handling keyDown, this should not trigger the click
      expect(mockToggleUnits).not.toHaveBeenCalled()

      fireEvent.click(unitsButton)
      expect(mockToggleUnits).toHaveBeenCalledTimes(1)
    })
  })
}) 