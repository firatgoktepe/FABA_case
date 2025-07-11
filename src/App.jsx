import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { WeatherProvider } from './contexts/WeatherContext'
import HomePage from './pages/HomePage'
import './styles/App.css'

function App() {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <WeatherProvider>
            <div className="App">
              <HomePage />
            </div>
          </WeatherProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App 