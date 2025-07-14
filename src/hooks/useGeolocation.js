import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Custom hook for managing geolocation
 * @param {object} defaultLocation - Default location if geolocation fails
 * @param {object} options - Geolocation options
 * @returns {object} - { location, error, isLoading, refetch }
 */
export const useGeolocation = (
  defaultLocation = { lat: 41.0082, lon: 28.9784 }, // Istanbul
  options = {
    timeout: 10000,
    enableHighAccuracy: false,
    maximumAge: 300000 // 5 minutes
  }
) => {
  const [location, setLocation] = useState(defaultLocation)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const hasAttemptedRef = useRef(false)

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      const geoError = new Error('Geolocation is not supported by this browser')
      setError(geoError)
      console.log('⚠️ Geolocation not supported, using default location:', defaultLocation)
      setLocation(defaultLocation)
      return
    }

    setIsLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        }
        
        console.log('✅ Geolocation success:', newLocation)
        setLocation(newLocation)
        setError(null)
        setIsLoading(false)
        hasAttemptedRef.current = true
      },
      (geoError) => {
        console.log('⚠️ Geolocation failed, using default location:', geoError.message)
        setError(geoError)
        setLocation(defaultLocation) // Use default location on error
        setIsLoading(false)
        hasAttemptedRef.current = true
      },
      options
    )
  }, [defaultLocation, options])

  // Auto-fetch location on mount only once
  useEffect(() => {
    if (!hasAttemptedRef.current) {
      getCurrentPosition()
    }
  }, [getCurrentPosition])

  return {
    location,
    error,
    isLoading,
    refetch: getCurrentPosition,
    hasAttempted: hasAttemptedRef.current
  }
} 