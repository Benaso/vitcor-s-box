import PixelCard from '../components/PixelCard'
import SectionTitle from '../components/SectionTitle'
import { useLanguage } from '../i18n/LanguageContext'

function Hobbies() {
  const { t } = useLanguage()

  return (
    <PixelCard style={{ marginTop: '96px' }}>
      <SectionTitle>{t.hobbies.section}</SectionTitle>
      <h1
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '18px',
          marginBottom: '16px',
          lineHeight: 1.8
        }}
      >
        {t.hobbies.title}
      </h1>
      <p
        style={{
          color: 'var(--color-text-muted)',
          fontSize: '14px',
          lineHeight: 1.8
        }}
      >
        {t.hobbies.body}
      </p>
    </PixelCard>
  )
}

export default Hobbies
