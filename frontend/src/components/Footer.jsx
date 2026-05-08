import { useLanguage } from '../i18n/LanguageContext'

function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="site-footer">
      {t.footer}
    </footer>
  )
}

export default Footer
