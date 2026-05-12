import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchSiteContent } from '../api/client'
import { languages as fallbackLanguages, translations as fallbackTranslations } from './translations'

const LanguageContext = createContext(null)
const storageKey = 'myweb-language'

function isObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value)
}

function mergeDeep(fallback, override) {
  if (!isObject(fallback) || !isObject(override)) {
    return override ?? fallback
  }

  return Object.keys({ ...fallback, ...override }).reduce((merged, key) => {
    merged[key] = mergeDeep(fallback[key], override[key])
    return merged
  }, {})
}

function getInitialLanguage() {
  const savedLanguage = window.localStorage.getItem(storageKey)
  if (savedLanguage && fallbackTranslations[savedLanguage]) {
    return savedLanguage
  }

  const browserLanguage = window.navigator.language.toLowerCase()
  if (browserLanguage.startsWith('de')) return 'de'
  if (browserLanguage.startsWith('ja')) return 'ja'
  if (browserLanguage.startsWith('zh')) return 'zh'
  return 'en'
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage)
  const [siteContent, setSiteContent] = useState({
    languages: fallbackLanguages,
    translations: fallbackTranslations
  })

  useEffect(() => {
    window.localStorage.setItem(storageKey, language)
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : language
  }, [language])

  useEffect(() => {
    let isMounted = true

    fetchSiteContent()
      .then((content) => {
        if (!isMounted) return

        setSiteContent({
          languages: content.languages ?? fallbackLanguages,
          translations: mergeDeep(fallbackTranslations, content.translations)
        })
      })
      .catch(() => {
        if (!isMounted) return

        setSiteContent({
          languages: fallbackLanguages,
          translations: fallbackTranslations
        })
      })

    return () => {
      isMounted = false
    }
  }, [])

  const value = useMemo(() => ({
    language,
    setLanguage,
    languages: siteContent.languages,
    t: siteContent.translations[language] ?? fallbackTranslations.en
  }), [language, siteContent])

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
