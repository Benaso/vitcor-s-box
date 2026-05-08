import PageScaffold from '../components/PageScaffold'
import { useLanguage } from '../i18n/LanguageContext'

function Projects() {
  const { t } = useLanguage()

  return <PageScaffold {...t.pages.projects} />
}

export default Projects
