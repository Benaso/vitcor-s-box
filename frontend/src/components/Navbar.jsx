import { Link } from 'react-router-dom'
import PixelButton from './PixelButton'

function Navbar() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: '16px',
        right: '24px',
        display: 'flex',
        gap: '12px',
        zIndex: 100
      }}
    >
      <Link to="/"><PixelButton>首页</PixelButton></Link>
      <Link to="/about"><PixelButton>关于</PixelButton></Link>
      <Link to="/projects"><PixelButton>项目</PixelButton></Link>
      <Link to="/blog"><PixelButton>碎碎念</PixelButton></Link>
    </nav>
  )
}

export default Navbar