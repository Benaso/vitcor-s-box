import { useState } from 'react'
import ParticleBackground from '../components/ParticleBackground'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PixelCard from '../components/PixelCard'
import PixelButton from '../components/PixelButton'
import homeData from '../data/home.json'

function Home() {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 })

  return (
    <>
      <ParticleBackground mousePos={mousePos} />
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 1
        }}
      >
        <Navbar />
        <main
          style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', width: '100%', maxWidth: '800px' }}
          onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
        >
          <h1
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'var(--color-text)',
              marginBottom: '16px',
              textAlign: 'center',
              letterSpacing: '2px'
            }}
          >
            YE DONGYU
          </h1>

          <p
            style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              color: 'var(--color-text-muted)',
              marginBottom: '40px',
              textAlign: 'center'
            }}
          >
            工业软件开发工程师
          </p>

          <div style={{ display: 'flex', gap: '16px', width: '100%', maxWidth: '600px', marginBottom: '40px' }}>
            <PixelCard style={{ flex: 1, textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginBottom: '8px' }}>// PROJECTS</div>
              <div style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text)' }}>
                {homeData.status.projects}
              </div>
            </PixelCard>
            <PixelCard style={{ flex: 1, textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginBottom: '8px' }}>// EXPERIENCE</div>
              <div style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text)' }}>
                {homeData.status.experience}
              </div>
            </PixelCard>
            <PixelCard style={{ flex: 1, textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginBottom: '8px' }}>// STACK</div>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text)' }}>
                {homeData.status.stack}
              </div>
            </PixelCard>
          </div>

          <PixelButton>VIEW PROJECTS ▶</PixelButton>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default Home