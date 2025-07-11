import React, { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useLanguage()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) return

    setIsLoading(true)
    try {
      if (onSearch) {
        await onSearch(searchTerm.trim())
      }
      setSearchTerm('')
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="search-bar">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('search.placeholder')}
          className="search-input"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="btn btn-primary search-button"
          disabled={isLoading || !searchTerm.trim()}
        >
          {isLoading ? (
            <span className="loading-spinner"></span>
          ) : (
            t('search.button')
          )}
        </button>
      </form>
    </div>
  )
}

export default SearchBar 