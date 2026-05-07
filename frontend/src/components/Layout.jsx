import Navbar from './Navbar'
import Footer from './Footer'

function Layout({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Navbar />
      <main style={{ flex: 1, padding: '32px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout