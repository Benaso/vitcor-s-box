import Navbar from './Navbar'
import Footer from './Footer'
import BTGlobalTerminal from './BTGlobalTerminal'

function Layout({ children }) {
  return (
    <div
      className="site-shell"
    >
      <Navbar />
      <main className="site-main">
        {children}
      </main>
      <BTGlobalTerminal />
      <Footer />
    </div>
  )
}

export default Layout
