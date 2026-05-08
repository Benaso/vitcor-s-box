import PageScaffold from '../components/PageScaffold'
import { useLanguage } from '../i18n/LanguageContext'

function Blog() {
  const { t } = useLanguage()

  return <PageScaffold {...t.pages.blog} />
}

export default Blog
