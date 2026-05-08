import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

function PixelRouteTransition() {
  const location = useLocation()
  const firstRenderRef = useRef(true)
  const timerRef = useRef(null)
  const [isActive, setIsActive] = useState(false)
  const { t } = useLanguage()

  const routeLabels = {
    '/': t.routes.home,
    '/about': t.routes.about,
    '/projects': t.routes.projects,
    '/blog': t.routes.blog,
    '/hobbies': t.routes.hobbies
  }

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false
      return undefined
    }

    window.clearTimeout(timerRef.current)
    setIsActive(true)

    timerRef.current = window.setTimeout(() => {
      setIsActive(false)
    }, 760)

    return () => {
      window.clearTimeout(timerRef.current)
    }
  }, [location.pathname])

  return (
    <div
      className={`pixel-transition ${isActive ? 'is-active' : ''}`}
      aria-hidden="true"
    >
      <div className="pixel-transition__frame" />
      <div className="pixel-transition__badge">
        <div className="pixel-transition__eyebrow">{t.transition.eyebrow}</div>
        <div className="pixel-transition__title">
          {routeLabels[location.pathname] || t.routes.page}
        </div>
        <div className="pixel-transition__meter">
          {Array.from({ length: 8 }).map((_, index) => (
            <span key={index} style={{ '--meter-index': index }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PixelRouteTransition
