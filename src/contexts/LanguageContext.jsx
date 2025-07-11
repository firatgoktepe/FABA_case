import React, { createContext, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import '../i18n/config'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const { i18n, t } = useTranslation()

  const changeLanguage = (language) => {
    i18n.changeLanguage(language)
    localStorage.setItem('language', language)
  }

  const value = {
    currentLanguage: i18n.language,
    changeLanguage,
    t,
    isEnglish: i18n.language === 'en',
    isSpanish: i18n.language === 'es'
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
} 