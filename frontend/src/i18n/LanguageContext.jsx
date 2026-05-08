import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { translations } from './translations'

const LanguageContext = createContext(null)
const storageKey = 'myweb-language'

function getInitialLanguage() {
  const savedLanguage = window.localStorage.getItem(storageKey)
  if (savedLanguage && translations[savedLanguage]) {
    return savedLanguage
  }

  const browserLanguage = window.navigator.language.toLowerCase()
  if (browserLanguage.startsWith('de')) return 'de'
  if (browserLanguage.startsWith('zh')) return 'zh'
  return 'en'
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage)

  useEffect(() => {
    window.localStorage.setItem(storageKey, language)
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : language
  }, [language])

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: translations[language]
  }), [language])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }
  return context
}
