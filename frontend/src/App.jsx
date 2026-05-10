import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Projects from './pages/Projects'
import Blog from './pages/Blog'
import Hobbies from './pages/Hobbies'
import Layout from './components/Layout'
import { AvatarRevealProvider } from './components/AvatarRevealContext'
import { BTTerminalProvider } from './components/BTTerminalContext'
import PixelRouteTransition from './components/PixelRouteTransition'
import { RouteTransitionProvider } from './components/RouteTransitionContext'
import { LanguageProvider } from './i18n/LanguageContext'

function App() {
  return (
    <LanguageProvider>
      <HashRouter>
        <RouteTransitionProvider>
          <BTTerminalProvider>
            <AvatarRevealProvider>
              <Layout>
                <PixelRouteTransition />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/hobbies" element={<Hobbies />} />
                </Routes>
              </Layout>
            </AvatarRevealProvider>
          </BTTerminalProvider>
        </RouteTransitionProvider>
      </HashRouter>
    </LanguageProvider>
  )
}

export default App