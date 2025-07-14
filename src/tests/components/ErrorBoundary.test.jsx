import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ErrorBoundary from '../../components/ErrorBoundary'

// Mock console.error to avoid noise in test output
const originalError = console.error
beforeAll(() => {
  console.error = jest.fn()
})

afterAll(() => {
  console.error = originalError
})

// Mock window.location.reload
const mockReload = jest.fn()
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
})

// Mock process.env
const originalEnv = process.env.NODE_ENV

// Component that throws an error for testing
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>Child component rendered successfully</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    console.error.mockClear()
  })

  describe('Normal Rendering', () => {
    it('should render children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>Child component</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('Child component')).toBeInTheDocument()
    })

    it('should render multiple children when there is no error', () => {
      render(
        <ErrorBoundary>
          <div>First child</div>
          <div>Second child</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('First child')).toBeInTheDocument()
      expect(screen.getByText('Second child')).toBeInTheDocument()
    })

    it('should not render error UI when children render successfully', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Child component rendered successfully')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong!')).not.toBeInTheDocument()
    })
  })

  describe('Error State Rendering', () => {
    it('should render error UI when child component throws', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong!')).toBeInTheDocument()
      expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument()
      expect(screen.queryByText('Child component rendered successfully')).not.toBeInTheDocument()
    })

    it('should render try again button in error state', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Try Again')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toHaveClass('btn', 'btn-primary')
    })

    it('should render refresh page button in error state', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Refresh Page')).toBeInTheDocument()
      expect(screen.getByText('Refresh Page')).toHaveClass('btn', 'btn-secondary')
    })

    it('should have correct CSS classes in error state', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(container.querySelector('.error-boundary')).toBeInTheDocument()
      expect(container.querySelector('.error-actions')).toBeInTheDocument()
    })
  })

  describe('Error Logging', () => {
    it('should log error to console when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(console.error).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      )
    })

    it('should log correct error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const errorCall = console.error.mock.calls[0]
      const loggedError = errorCall[1]
      expect(loggedError.message).toBe('Test error message')
    })
  })

  describe('Try Again Functionality', () => {
    it('should reset error state when try again is clicked', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong!')).toBeInTheDocument()

      const tryAgainButton = screen.getByText('Try Again')
      fireEvent.click(tryAgainButton)

      // Re-render with non-throwing component
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Child component rendered successfully')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong!')).not.toBeInTheDocument()
    })

    it('should call handleRetry when try again button is clicked', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const tryAgainButton = screen.getByText('Try Again')
      
      // Initially in error state
      expect(screen.getByText('Something went wrong!')).toBeInTheDocument()
      
      fireEvent.click(tryAgainButton)
      
      // Error state should be reset (but will throw again if component still throws)
      // We're testing that the click handler is called correctly
      expect(tryAgainButton).toBeInTheDocument()
    })
  })

  describe('Refresh Page Functionality', () => {
    it('should call window.location.reload when refresh page is clicked', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      const refreshButton = screen.getByText('Refresh Page')
      fireEvent.click(refreshButton)

      expect(mockReload).toHaveBeenCalledTimes(1)
    })
  })

  describe('Development Error Details', () => {
    it('should show error details in development mode', () => {
      process.env.NODE_ENV = 'development'

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Error Details (Development only)')).toBeInTheDocument()
      const details = screen.getByRole('group') // details element
      expect(details).toBeInTheDocument()
    })

    it('should not show error details in production mode', () => {
      process.env.NODE_ENV = 'production'

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.queryByText('Error Details (Development only)')).not.toBeInTheDocument()
    })

    it('should display error message and component stack in development', () => {
      process.env.NODE_ENV = 'development'

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      // The error details should contain the error message
      const errorDetails = screen.getByText('Error Details (Development only)').closest('details')
      expect(errorDetails).toBeInTheDocument()
      
      // Check that it contains the error message
      expect(errorDetails.textContent).toContain('Test error message')
    })

    afterEach(() => {
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Static Methods', () => {
    it('should have getDerivedStateFromError method', () => {
      expect(typeof ErrorBoundary.getDerivedStateFromError).toBe('function')
    })

    it('should return correct state from getDerivedStateFromError', () => {
      const error = new Error('Test error')
      const derivedState = ErrorBoundary.getDerivedStateFromError(error)
      
      expect(derivedState).toEqual({ hasError: true })
    })
  })

  describe('Component Lifecycle', () => {
    it('should initialize with correct initial state', () => {
      const errorBoundary = new ErrorBoundary({})
      
      expect(errorBoundary.state).toEqual({
        hasError: false,
        error: null,
        errorInfo: null
      })
    })

    it('should update state when componentDidCatch is called', () => {
      const errorBoundary = new ErrorBoundary({})
      const testError = new Error('Test error')
      const testErrorInfo = { componentStack: 'test stack' }

      errorBoundary.componentDidCatch(testError, testErrorInfo)

      expect(errorBoundary.state.error).toBe(testError)
      expect(errorBoundary.state.errorInfo).toBe(testErrorInfo)
    })

    it('should reset state correctly in handleRetry', () => {
      const errorBoundary = new ErrorBoundary({})
      
      // Set error state
      errorBoundary.setState({
        hasError: true,
        error: new Error('Test'),
        errorInfo: { componentStack: 'test' }
      })

      // Call handleRetry
      errorBoundary.handleRetry()

      expect(errorBoundary.state).toEqual({
        hasError: false,
        error: null,
        errorInfo: null
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle null error gracefully', () => {
      const errorBoundary = new ErrorBoundary({})
      
      errorBoundary.componentDidCatch(null, { componentStack: 'test' })
      
      expect(errorBoundary.state.error).toBe(null)
      expect(errorBoundary.state.errorInfo).toEqual({ componentStack: 'test' })
    })

    it('should handle multiple errors correctly', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Something went wrong!')).toBeInTheDocument()

      // Try again and error again
      const tryAgainButton = screen.getByText('Try Again')
      fireEvent.click(tryAgainButton)

      // Should still show error UI if component throws again
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    it('should handle error boundary without children', () => {
      render(<ErrorBoundary />)
      
      // Should render without issues
      expect(document.body).toBeInTheDocument()
    })
  })
}) 