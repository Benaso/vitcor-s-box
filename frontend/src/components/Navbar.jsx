import { Link, useLocation, useNavigate } from 'react-router-dom'
import PixelButton from './PixelButton'
import { useAvatarReveal } from './AvatarRevealContext'
import { useLanguage } from '../i18n/LanguageContext'
import { useState } from 'react'
import { useRouteTransition } from './RouteTransitionContext'

function Navbar() {
  const { language, languages, setLanguage, t } = useLanguage()
  const { isAvatarRevealed } = useAvatarReveal()
  const { isRouteTransitioning, startRouteTransition } = useRouteTransition()
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)
  const handleNavClick = (event, item) => {
    event.preventDefault()

    if (isRouteTransitioning) {
      event.stopPropagation()
      return
    }

    if (location.pathname === item.to) {
      closeMenu()
      return
    }

    closeMenu()
    startRouteTransition(item.label, () => navigate(item.to))
  }

  const navItems = [
    { to: '/', label: t.nav.home },
    { to: '/projects', label: t.nav.projects },
    { to: '/blog', label: t.nav.blog },
    { to: '/hobbies', label: t.nav.hobbies },
    { to: '/about', label: t.nav.about }
  ]
  const shouldShowOnlyLanguage = location.pathname === '/' && !isAvatarRevealed

  return (
    <nav className={`site-nav ${isMenuOpen ? 'is-open' : ''} ${shouldShowOnlyLanguage ? 'is-language-only' : ''}`}>
      {!shouldShowOnlyLanguage && (
        <>
          <Link
            className="site-nav__brand"
            to="/"
            aria-disabled={isRouteTransitioning}
            onClick={(event) => handleNavClick(event, navItems[0])}
          >
            MOON.DEV
          </Link>
          <button
            className="site-nav__toggle"
            type="button"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            MENU
          </button>
        </>
      )}
      <div className="site-nav__panel">
        {!shouldShowOnlyLanguage && navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            aria-disabled={isRouteTransitioning}
            onClick={(event) => handleNavClick(event, item)}
          >
            <PixelButton disabled={isRouteTransitioning}>{item.label}</PixelButton>
          </Link>
        ))}
        <div className="language-switcher" aria-label="Language">
          {languages.map((item) => (
            <button
              key={item.code}
              type="button"
              className={language === item.code ? 'is-active' : undefined}
              onClick={() => setLanguage(item.code)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
