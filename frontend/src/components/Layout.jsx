import Navbar from './Navbar'
import Footer from './Footer'
import BTSplitPanel from './BTSplitPanel'

function Layout({ children }) {
  return (
    <div className="site-shell">
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
