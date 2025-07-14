import { renderHook, act, waitFor } from '@testing-library/react'
import { useGeolocation } from '../../hooks/useGeolocation'

describe('useGeolocation', () => {
  const mockPosition = {
    coords: {
      latitude: 40.7128,
      longitude: -74.0060,
    },
  }

  const defaultLocation = { lat: 41.0082, lon: 28.9784 }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Successful Geolocation', () => {
    it('should return default location initially and then update with geolocation', async () => {
      navigator.geolocation.getCurrentPosition.mockImplementation((success) => {
        setTimeout(() => success(mockPosition), 100)
      })

      const { result } = renderHook(() => useGeolocation())

      // Initially should have default location
      expect(result.current.location).toEqual(defaultLocation)
      expect(result.current.isLoading).toBe(true)
      expect(result.current.error).toBe(null)
      expect(result.current.hasAttempted).toBe(false)

      // Wait for geolocation to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.location).toEqual({
        lat: mockPosition.coords.latitude,
        lon: mockPosition.coords.longitude,
      })
      expect(result.current.error).toBe(null)
      expect(result.current.hasAttempted).toBe(true)
      expect(console.log).toHaveBeenCalledWith('✅ Geolocation success:', {
        lat: mockPosition.coords.latitude,
        lon: mockPosition.coords.longitude,
      })
    })

    it('should only attempt geolocation once', async () => {
      navigator.geolocation.getCurrentPosition.mockImplementation((success) => {
        setTimeout(() => success(mockPosition), 50)
      })

      const { rerender } = renderHook(() => useGeolocation())

      await waitFor(() => {
        expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1)
      })

      // Rerender the hook
      rerender()

      // Should not call geolocation again
      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1)
    })
  })

  describe('Geolocation Errors', () => {
    it('should handle geolocation errors gracefully', async () => {
      const geoError = new Error('Permission denied')
      navigator.geolocation.getCurrentPosition.mockImplementation((success, error) => {
        setTimeout(() => error(geoError), 100)
      })

      const { result } = renderHook(() => useGeolocation())

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.location).toEqual(defaultLocation)
      expect(result.current.error).toBe(geoError)
      expect(result.current.hasAttempted).toBe(true)
      expect(console.log).toHaveBeenCalledWith(
        '⚠️ Geolocation failed, using default location:',
        geoError.message
      )
    })

    it('should handle unsupported geolocation', () => {
      // Mock unsupported geolocation
      const originalGeolocation = navigator.geolocation
      delete navigator.geolocation

      const { result } = renderHook(() => useGeolocation())

      expect(result.current.location).toEqual(defaultLocation)
      expect(result.current.error).toEqual(
        new Error('Geolocation is not supported by this browser')
      )
      expect(result.current.isLoading).toBe(false)
      expect(console.log).toHaveBeenCalledWith(
        '⚠️ Geolocation not supported, using default location:',
        defaultLocation
      )

      // Restore geolocation
      navigator.geolocation = originalGeolocation
    })
  })

  describe('Custom Options', () => {
    it('should use custom default location', () => {
      const customDefault = { lat: 51.5074, lon: -0.1278 } // London
      
      const { result } = renderHook(() => useGeolocation(customDefault))

      expect(result.current.location).toEqual(customDefault)
    })

    it('should pass custom options to getCurrentPosition', async () => {
      const customOptions = {
        timeout: 5000,
        enableHighAccuracy: true,
        maximumAge: 60000,
      }

      navigator.geolocation.getCurrentPosition.mockImplementation((success) => {
        setTimeout(() => success(mockPosition), 100)
      })

      renderHook(() => useGeolocation(defaultLocation, customOptions))

      await waitFor(() => {
        expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledWith(
          expect.any(Function),
          expect.any(Function),
          customOptions
        )
      })
    })
  })

  describe('Refetch Functionality', () => {
    it('should allow manual refetch of geolocation', async () => {
      navigator.geolocation.getCurrentPosition.mockImplementation((success) => {
        setTimeout(() => success(mockPosition), 50)
      })

      const { result } = renderHook(() => useGeolocation())

      // Wait for initial call
      await waitFor(() => {
        expect(result.current.hasAttempted).toBe(true)
      })

      expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1)

      // Call refetch
      act(() => {
        result.current.refetch()
      })

      await waitFor(() => {
        expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(2)
      })
    })

    it('should update loading state during refetch', async () => {
      let resolvePromise
      navigator.geolocation.getCurrentPosition.mockImplementation((success) => {
        resolvePromise = () => success(mockPosition)
      })

      const { result } = renderHook(() => useGeolocation())

      // Wait for initial call to complete
      act(() => {
        resolvePromise()
      })
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      // Start refetch
      act(() => {
        result.current.refetch()
      })

      expect(result.current.isLoading).toBe(true)

      // Complete refetch
      act(() => {
        resolvePromise()
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })
    })
  })

  describe('Return Value Structure', () => {
    it('should return correct structure', () => {
      const { result } = renderHook(() => useGeolocation())

      expect(result.current).toHaveProperty('location')
      expect(result.current).toHaveProperty('error')
      expect(result.current).toHaveProperty('isLoading')
      expect(result.current).toHaveProperty('refetch')
      expect(result.current).toHaveProperty('hasAttempted')

      expect(typeof result.current.refetch).toBe('function')
      expect(typeof result.current.hasAttempted).toBe('boolean')
    })
  })
}) 