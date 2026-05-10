import Navbar from './Navbar'
import Footer from './Footer'
import BTSplitPanel from './BTSplitPanel'
import { useBTTerminal } from './BTTerminalContext'

function Layout({ children }) {
  const { isSplitMode } = useBTTerminal()

  return (
    <div className={`site-shell ${isSplitMode ? 'site-shell--split' : ''}`}>
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
