import { Link } from 'react-router-dom'
import PixelButton from './PixelButton'
import { languages } from '../i18n/translations'
import { useLanguage } from '../i18n/LanguageContext'
import { useState } from 'react'

function Navbar() {
  const { language, setLanguage, t } = useLanguage()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <nav className={`site-nav ${isMenuOpen ? 'is-open' : ''}`}>
      <Link className="site-nav__brand" to="/" onClick={closeMenu}>
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
      <div className="site-nav__panel">
        <Link to="/" onClick={closeMenu}><PixelButton>{t.nav.home}</PixelButton></Link>
        <Link to="/about" onClick={closeMenu}><PixelButton>{t.nav.about}</PixelButton></Link>
        <Link to="/projects" onClick={closeMenu}><PixelButton>{t.nav.projects}</PixelButton></Link>
        <Link to="/blog" onClick={closeMenu}><PixelButton>{t.nav.blog}</PixelButton></Link>
        <Link to="/hobbies" onClick={closeMenu}><PixelButton>{t.nav.hobbies}</PixelButton></Link>
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
