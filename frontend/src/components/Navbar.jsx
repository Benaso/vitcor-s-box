import { Link } from 'react-router-dom'
import PixelButton from './PixelButton'

function Navbar() {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        borderBottom: 'var(--border-width) solid var(--color-border)'
      }}
    >
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: '16px',
          fontWeight: 'bold',
          letterSpacing: '2px'
        }}
      >
        MOON.DEV
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <Link to="/"><PixelButton>首页</PixelButton></Link>
        <Link to="/about"><PixelButton>关于</PixelButton></Link>
        <Link to="/projects"><PixelButton>项目</PixelButton></Link>
        <Link to="/blog"><PixelButton>碎碎念</PixelButton></Link>
      </div>
    </nav>
  )
}

export default Navbar