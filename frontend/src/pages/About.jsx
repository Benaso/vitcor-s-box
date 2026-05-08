import PageScaffold from '../components/PageScaffold'
import { useLanguage } from '../i18n/LanguageContext'

function About() {
  const { t } = useLanguage()

  return <PageScaffold {...t.pages.about} />
}

export default About
