import { useQuery, useMutation } from '@tanstack/react-query'
import weatherService from '../services/weatherService'

/**
 * Custom hook for fetching current weather data
 * @param {object} location - { lat, lon }
 * @param {string} units - 'metric' or 'imperial'
 * @param {object} options - Additional query options
 * @returns {object} - Query result with data, isLoading, error, etc.
 */
export const useCurrentWeather = (location, units = 'metric', options = {}) => {
  return useQuery({
    queryKey: ['currentWeather', location, units],
    queryFn: () => {
      if (!location?.lat || !location?.lon) {
        return null
      }
      return weatherService.fetchCurrentWeatherByCoords(
        location.lat, 
        location.lon, 
        units
      )
    },
    enabled: !!(location?.lat && location?.lon),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    ...options
  })
}

/**
 * Custom hook for fetching forecast data
 * @param {object} location - { lat, lon }
 * @param {string} units - 'metric' or 'imperial'
 * @param {object} options - Additional query options
 * @returns {object} - Query result with data, isLoading, error, etc.
 */
export const useForecastWeather = (location, units = 'metric', options = {}) => {
  return useQuery({
    queryKey: ['forecast', location, units],
    queryFn: () => {
      if (!location?.lat || !location?.lon) {
        return null
      }
      return weatherService.fetchForecast(
        location.lat, 
        location.lon, 
        units
      )
    },
    enabled: !!(location?.lat && location?.lon),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...options
  })
}

/**
 * Custom hook for searching weather by city name
 * @param {string} units - 'metric' or 'imperial'
 * @returns {object} - { searchWeather, isLoading, error }
 */
export const useWeatherSearch = (units = 'metric') => {
  const { mutateAsync, isLoading, error } = useMutation({
    mutationFn: (cityName) => weatherService.fetchCurrentWeather(cityName, units),
    retry: 1
  })

  return {
    searchWeather: mutateAsync,
    isLoading,
    error
  }
} 