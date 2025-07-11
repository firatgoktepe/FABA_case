import { API_URLS } from '../constants/api'

class WeatherService {
  async fetchCurrentWeather(city, units = 'metric') {
    try {
      const response = await fetch(API_URLS.currentWeather(city, units))
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('City not found')
        }
        throw new Error('Failed to fetch weather data')
      }
      
      const data = await response.json()
      return this.transformCurrentWeatherData(data)
    } catch (error) {
      throw new Error(error.message || 'Network error occurred')
    }
  }

  async fetchCurrentWeatherByCoords(lat, lon, units = 'metric') {
    try {
      const response = await fetch(API_URLS.currentWeatherByCoords(lat, lon, units))
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data')
      }
      
      const data = await response.json()
      return this.transformCurrentWeatherData(data)
    } catch (error) {
      throw new Error(error.message || 'Network error occurred')
    }
  }

  async fetchForecast(lat, lon, units = 'metric') {
    try {
      const response = await fetch(API_URLS.forecastByCoords(lat, lon, units))
      
      if (!response.ok) {
        throw new Error('Failed to fetch forecast data')
      }
      
      const data = await response.json()
      return this.transformForecastData(data)
    } catch (error) {
      throw new Error(error.message || 'Network error occurred')
    }
  }

  transformCurrentWeatherData(data) {
    return {
      id: data.id,
      name: data.name,
      country: data.sys.country,
      coordinates: {
        lat: data.coord.lat,
        lon: data.coord.lon
      },
      weather: {
        main: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      },
      temperature: {
        current: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        min: Math.round(data.main.temp_min),
        max: Math.round(data.main.temp_max)
      },
      details: {
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        visibility: data.visibility ? Math.round(data.visibility / 1000) : null,
        windSpeed: data.wind?.speed || 0,
        windDirection: data.wind?.deg || 0
      },
      sun: {
        sunrise: new Date(data.sys.sunrise * 1000),
        sunset: new Date(data.sys.sunset * 1000)
      },
      timestamp: new Date(data.dt * 1000)
    }
  }

  transformForecastData(data) {
    // Group forecasts by day (5-day forecast API returns 3-hour intervals)
    const dailyForecasts = this.groupForecastsByDay(data.list)
    
    return {
      daily: dailyForecasts.slice(0, 7).map(dayData => ({
        date: new Date(dayData.dt * 1000),
        temperature: {
          min: Math.round(dayData.minTemp),
          max: Math.round(dayData.maxTemp),
          day: Math.round(dayData.temp)
        },
        humidity: dayData.humidity,
        pressure: dayData.pressure,
        windSpeed: dayData.windSpeed,
        windDirection: dayData.windDirection,
        weather: {
          main: dayData.weather.main,
          description: dayData.weather.description,
          icon: dayData.weather.icon
        },
        pop: dayData.pop || 0
      }))
    }
  }

  groupForecastsByDay(forecastList) {
    const dailyData = {}
    
    forecastList.forEach(forecast => {
      const date = new Date(forecast.dt * 1000)
      const dateKey = date.toDateString()
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          dt: forecast.dt,
          temps: [],
          humidity: forecast.main.humidity,
          pressure: forecast.main.pressure,
          windSpeed: forecast.wind?.speed || 0,
          windDirection: forecast.wind?.deg || 0,
          weather: forecast.weather[0],
          pop: forecast.pop || 0
        }
      }
      
      dailyData[dateKey].temps.push(forecast.main.temp)
      // Update pop to highest probability for the day
      if (forecast.pop > dailyData[dateKey].pop) {
        dailyData[dateKey].pop = forecast.pop
      }
    })
    
    // Calculate min/max temps for each day
    return Object.values(dailyData).map(day => ({
      ...day,
      temp: day.temps.reduce((sum, temp) => sum + temp, 0) / day.temps.length,
      minTemp: Math.min(...day.temps),
      maxTemp: Math.max(...day.temps)
    }))
  }
}

export default new WeatherService() 