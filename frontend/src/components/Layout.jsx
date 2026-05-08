import Navbar from './Navbar'
import Footer from './Footer'

function Layout({ children }) {
  return (
    <div
      className="site-shell"
    >
      <Navbar />
      <main className="site-main">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
