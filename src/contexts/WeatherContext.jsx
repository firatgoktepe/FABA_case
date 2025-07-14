import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'

const WeatherContext = createContext()

export const useWeather = () => {
  const context = useContext(WeatherContext)
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider')
  }
  return context
}

export const WeatherProvider = ({ children }) => {
  // Set default location to Istanbul instead of null
  const [currentLocation, setCurrentLocation] = useState({
    lat: 41.0082,
    lon: 28.9784
  })
  const [units, setUnits] = useState(() => {
    return localStorage.getItem('units') || 'metric'
  })
  const [savedCities, setSavedCities] = useState(() => {
    const saved = localStorage.getItem('savedCities')
    return saved ? JSON.parse(saved) : []
  })

  const toggleUnits = useCallback(() => {
    setUnits(prevUnits => {
      const newUnits = prevUnits === 'metric' ? 'imperial' : 'metric'
      localStorage.setItem('units', newUnits)
      return newUnits
    })
  }, [])

  const addSavedCity = useCallback((city) => {
    setSavedCities(prevCities => {
      const newCities = [...prevCities, city]
      localStorage.setItem('savedCities', JSON.stringify(newCities))
      return newCities
    })
  }, [])

  const removeSavedCity = useCallback((cityId) => {
    setSavedCities(prevCities => {
      const newCities = prevCities.filter(city => city.id !== cityId)
      localStorage.setItem('savedCities', JSON.stringify(newCities))
      return newCities
    })
  }, [])

  const updateCurrentLocation = useCallback((location) => {
    setCurrentLocation(location)
  }, [])

  useEffect(() => {
    // Try to get user's current location, but don't break if it fails
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ Geolocation success:', position.coords)
          setCurrentLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (error) => {
          console.log('⚠️ Geolocation failed, using default location (Istanbul):', error.message)
          // Keep default Istanbul location - don't change anything
        },
        {
          timeout: 10000,
          enableHighAccuracy: false,
          maximumAge: 300000 // 5 minutes
        }
      )
    } else {
      console.log('⚠️ Geolocation not supported, using default location (Istanbul)')
    }
  }, [])

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