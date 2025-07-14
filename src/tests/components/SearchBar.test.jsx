import React from 'react'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders, createMockTranslation } from '../utils/testUtils'
import SearchBar from '../../components/SearchBar'
import { useLanguage } from '../../contexts/LanguageContext'

// Mock the language context
jest.mock('../../contexts/LanguageContext')

describe('SearchBar', () => {
  const mockT = createMockTranslation()
  const mockOnSearch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    useLanguage.mockReturnValue({ t: mockT })
  })

  describe('Rendering', () => {
    it('should render search form with input and button', () => {
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument()
      expect(screen.getByText('Search')).toBeInTheDocument()
    })

    it('should have correct CSS classes', () => {
      const { container } = renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      expect(container.querySelector('.search-bar')).toBeInTheDocument()
      expect(container.querySelector('.search-form')).toBeInTheDocument()
      expect(container.querySelector('.search-input')).toBeInTheDocument()
      expect(container.querySelector('.search-button')).toBeInTheDocument()
    })

    it('should render input with correct attributes', () => {
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      expect(input).toHaveAttribute('type', 'text')
      expect(input).toHaveClass('search-input')
    })

    it('should render button with correct attributes', () => {
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const button = screen.getByText('Search')
      expect(button).toHaveAttribute('type', 'submit')
      expect(button).toHaveClass('btn', 'btn-primary', 'search-button')
    })
  })

  describe('Input Handling', () => {
    it('should update input value when typing', () => {
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      
      fireEvent.change(input, { target: { value: 'New York' } })
      
      expect(input.value).toBe('New York')
    })

    it('should start with empty input value', () => {
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      expect(input.value).toBe('')
    })

    it('should handle multiple character inputs', () => {
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      
      fireEvent.change(input, { target: { value: 'L' } })
      expect(input.value).toBe('L')
      
      fireEvent.change(input, { target: { value: 'Lo' } })
      expect(input.value).toBe('Lo')
      
      fireEvent.change(input, { target: { value: 'London' } })
      expect(input.value).toBe('London')
    })

    it('should handle special characters in input', () => {
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      
      fireEvent.change(input, { target: { value: 'São Paulo' } })
      expect(input.value).toBe('São Paulo')
    })
  })

  describe('Form Submission', () => {
    it('should call onSearch when form is submitted with valid input', async () => {
      mockOnSearch.mockResolvedValue()
      
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      const form = screen.getByRole('form')
      
      fireEvent.change(input, { target: { value: 'New York' } })
      fireEvent.submit(form)

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('New York')
      })
    })

    it('should call onSearch when search button is clicked', async () => {
      mockOnSearch.mockResolvedValue()
      
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      const button = screen.getByText('Search')
      
      fireEvent.change(input, { target: { value: 'London' } })
      fireEvent.click(button)

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('London')
      })
    })

    it('should trim whitespace from search term', async () => {
      mockOnSearch.mockResolvedValue()
      
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      const form = screen.getByRole('form')
      
      fireEvent.change(input, { target: { value: '  Tokyo  ' } })
      fireEvent.submit(form)

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('Tokyo')
      })
    })

    it('should clear input after successful search', async () => {
      mockOnSearch.mockResolvedValue()
      
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      const form = screen.getByRole('form')
      
      fireEvent.change(input, { target: { value: 'Paris' } })
      fireEvent.submit(form)

      await waitFor(() => {
        expect(input.value).toBe('')
      })
    })

    it('should not call onSearch when input is empty', () => {
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const form = screen.getByRole('form')
      fireEvent.submit(form)

      expect(mockOnSearch).not.toHaveBeenCalled()
    })

    it('should not call onSearch when input contains only whitespace', () => {
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      const form = screen.getByRole('form')
      
      fireEvent.change(input, { target: { value: '   ' } })
      fireEvent.submit(form)

      expect(mockOnSearch).not.toHaveBeenCalled()
    })
  })

  describe('Loading State', () => {
    it('should show loading state during search', async () => {
      // Mock a delayed promise
      let resolveSearch
      const searchPromise = new Promise(resolve => {
        resolveSearch = resolve
      })
      mockOnSearch.mockReturnValue(searchPromise)
      
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      const form = screen.getByRole('form')
      
      fireEvent.change(input, { target: { value: 'Berlin' } })
      fireEvent.submit(form)

      // Should show loading spinner
      expect(screen.getByRole('presentation')).toBeInTheDocument() // loading-spinner
      expect(screen.queryByText('Search')).not.toBeInTheDocument()

      // Resolve the promise
      resolveSearch()
      
      await waitFor(() => {
        expect(screen.getByText('Search')).toBeInTheDocument()
        expect(screen.queryByRole('presentation')).not.toBeInTheDocument()
      })
    })

    it('should disable input during loading', async () => {
      let resolveSearch
      const searchPromise = new Promise(resolve => {
        resolveSearch = resolve
      })
      mockOnSearch.mockReturnValue(searchPromise)
      
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      const form = screen.getByRole('form')
      
      fireEvent.change(input, { target: { value: 'Madrid' } })
      fireEvent.submit(form)

      expect(input).toBeDisabled()

      resolveSearch()
      
      await waitFor(() => {
        expect(input).not.toBeDisabled()
      })
    })

    it('should disable button during loading', async () => {
      let resolveSearch
      const searchPromise = new Promise(resolve => {
        resolveSearch = resolve
      })
      mockOnSearch.mockReturnValue(searchPromise)
      
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      const button = screen.getByRole('button')
      const form = screen.getByRole('form')
      
      fireEvent.change(input, { target: { value: 'Rome' } })
      fireEvent.submit(form)

      expect(button).toBeDisabled()

      resolveSearch()
      
      await waitFor(() => {
        expect(button).not.toBeDisabled()
      })
    })
  })

  describe('Button State', () => {
    it('should disable button when input is empty', () => {
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const button = screen.getByText('Search')
      expect(button).toBeDisabled()
    })

    it('should disable button when input contains only whitespace', () => {
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      const button = screen.getByText('Search')
      
      fireEvent.change(input, { target: { value: '   ' } })
      
      expect(button).toBeDisabled()
    })

    it('should enable button when input has valid content', () => {
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      const button = screen.getByText('Search')
      
      fireEvent.change(input, { target: { value: 'Vienna' } })
      
      expect(button).not.toBeDisabled()
    })

    it('should enable button when input has content with spaces', () => {
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      const button = screen.getByText('Search')
      
      fireEvent.change(input, { target: { value: 'New York' } })
      
      expect(button).not.toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    it('should handle search errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const searchError = new Error('Search failed')
      mockOnSearch.mockRejectedValue(searchError)
      
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      const form = screen.getByRole('form')
      
      fireEvent.change(input, { target: { value: 'Invalid City' } })
      fireEvent.submit(form)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Search error:', searchError)
      })

      // Should reset loading state after error
      expect(screen.getByText('Search')).toBeInTheDocument()
      expect(screen.queryByRole('presentation')).not.toBeInTheDocument()

      consoleErrorSpy.mockRestore()
    })

    it('should not clear input when search fails', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {})
      mockOnSearch.mockRejectedValue(new Error('Search failed'))
      
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      const form = screen.getByRole('form')
      
      fireEvent.change(input, { target: { value: 'Invalid City' } })
      fireEvent.submit(form)

      await waitFor(() => {
        expect(input.value).toBe('Invalid City')
      })

      console.error.mockRestore()
    })
  })

  describe('Translation Integration', () => {
    it('should use translation for placeholder text', () => {
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      expect(mockT).toHaveBeenCalledWith('search.placeholder')
    })

    it('should use translation for button text', () => {
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      expect(mockT).toHaveBeenCalledWith('search.button')
    })
  })

  describe('Component Without onSearch Prop', () => {
    it('should render correctly without onSearch prop', () => {
      renderWithProviders(<SearchBar />)

      expect(screen.getByPlaceholderText('Search for a city...')).toBeInTheDocument()
      expect(screen.getByText('Search')).toBeInTheDocument()
    })

    it('should handle form submission without onSearch prop', async () => {
      renderWithProviders(<SearchBar />)

      const input = screen.getByPlaceholderText('Search for a city...')
      const form = screen.getByRole('form')
      
      fireEvent.change(input, { target: { value: 'Test City' } })
      fireEvent.submit(form)

      // Should not throw error and should clear input
      await waitFor(() => {
        expect(input.value).toBe('')
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long city names', async () => {
      mockOnSearch.mockResolvedValue()
      
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      const form = screen.getByRole('form')
      const longCityName = 'A'.repeat(100)
      
      fireEvent.change(input, { target: { value: longCityName } })
      fireEvent.submit(form)

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith(longCityName)
      })
    })

    it('should handle unicode characters', async () => {
      mockOnSearch.mockResolvedValue()
      
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      const form = screen.getByRole('form')
      
      fireEvent.change(input, { target: { value: '北京' } })
      fireEvent.submit(form)

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith('北京')
      })
    })

    it('should handle rapid form submissions', async () => {
      mockOnSearch.mockResolvedValue()
      
      renderWithProviders(<SearchBar onSearch={mockOnSearch} />)

      const input = screen.getByPlaceholderText('Search for a city...')
      const form = screen.getByRole('form')
      
      fireEvent.change(input, { target: { value: 'City1' } })
      fireEvent.submit(form)
      
      fireEvent.change(input, { target: { value: 'City2' } })
      fireEvent.submit(form)

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledTimes(2)
      })
    })
  })
}) 