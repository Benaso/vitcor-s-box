import { useEffect } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import BTSplitPanel from './BTSplitPanel'
import { useBTTerminal } from './BTTerminalContext'

function Layout({ children }) {
  const { isBTTerminalEnabled, isBTTerminalOpen, isSplitMode } = useBTTerminal()

  useEffect(() => {
    if (isSplitMode) {
      document.documentElement.classList.add('site-shell--terminal-docked')
      document.body.classList.add('site-shell--terminal-docked')
    } else {
      document.documentElement.classList.remove('site-shell--terminal-docked')
      document.body.classList.remove('site-shell--terminal-docked')
    }
  }, [isSplitMode])

  const shellClassName = [
    'site-shell',
    isSplitMode ? 'site-shell--split' : '',
    isBTTerminalEnabled && !isBTTerminalOpen ? 'site-shell--terminal-docked' : ''
  ].filter(Boolean).join(' ')

  return (
    <div className={shellClassName}>
      <Navbar />
      <main className="site-main">
        {children}
      </main>
      <BTSplitPanel />
      <Footer />
    </div>
  )
}

export default Layout
