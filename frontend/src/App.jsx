import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Hobbies from './pages/Hobbies'
import Layout from './components/Layout'
import PixelRouteTransition from './components/PixelRouteTransition'
import { LanguageProvider } from './i18n/LanguageContext'

function App() {
  return (
    <LanguageProvider>
      <HashRouter>
        <Layout>
          <PixelRouteTransition />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hobbies" element={<Hobbies />} />
          </Routes>
        </Layout>
      </HashRouter>
    </LanguageProvider>
  )
}

export default App
