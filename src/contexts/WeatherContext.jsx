import React, { createContext, useContext, useMemo, useCallback, useRef } from 'react'
import { useLocalStorage, useGeolocation } from '../hooks'

const WeatherContext = createContext()

export const useWeather = () => {
  const context = useContext(WeatherContext)
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider')
  }
  return context
}

export const WeatherProvider = ({ children }) => {
  // Use custom hooks for localStorage management
  const [units, setUnits] = useLocalStorage('units', 'metric')
  const [savedCities, setSavedCities] = useLocalStorage('savedCities', [])
  
  // Use custom hook for geolocation
  const { location: geoLocation, hasAttempted } = useGeolocation()
  const [currentLocation, setCurrentLocation] = useLocalStorage('currentLocation', {
    lat: 41.0082,
    lon: 28.9784
  })
  
  const hasUpdatedFromGeoRef = useRef(false)

  // Update current location when geolocation is obtained for the first time
  React.useEffect(() => {
    if (
      hasAttempted && 
      geoLocation && 
      !hasUpdatedFromGeoRef.current &&
      (currentLocation.lat === 41.0082 && currentLocation.lon === 28.9784) // Only if still using default Istanbul location
    ) {
      console.log('🔄 Updating location from geolocation:', geoLocation)
      setCurrentLocation(geoLocation)
      hasUpdatedFromGeoRef.current = true
    }
  }, [geoLocation, hasAttempted, currentLocation, setCurrentLocation])

  const toggleUnits = useCallback(() => {
    setUnits(prevUnits => prevUnits === 'metric' ? 'imperial' : 'metric')
  }, [setUnits])

  const addSavedCity = useCallback((city) => {
    setSavedCities(prevCities => {
      // Check if city already exists
      const exists = prevCities.some(existingCity => existingCity.id === city.id)
      if (exists) return prevCities
      
      return [...prevCities, city]
    })
  }, [setSavedCities])

  const removeSavedCity = useCallback((cityId) => {
    setSavedCities(prevCities => prevCities.filter(city => city.id !== cityId))
  }, [setSavedCities])

  const updateCurrentLocation = useCallback((location) => {
    setCurrentLocation(location)
    hasUpdatedFromGeoRef.current = true // Mark as manually updated
  }, [setCurrentLocation])

  const isMetric = useMemo(() => units === 'metric', [units])

  const value = useMemo(() => ({
    currentLocation,
    updateCurrentLocation,
    units,
    toggleUnits,
    savedCities,
    addSavedCity,
    removeSavedCity,
    isMetric
  }), [
    currentLocation,
    updateCurrentLocation,
    units,
    toggleUnits,
    savedCities,
    addSavedCity,
    removeSavedCity,
    isMetric
  ])

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  )
} 