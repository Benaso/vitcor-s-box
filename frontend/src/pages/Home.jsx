import { useRef, useState } from 'react'
import ParticleBackground from '../components/ParticleBackground'
import PixelCard from '../components/PixelCard'
import PixelButton from '../components/PixelButton'
import homeData from '../data/home.json'
import { useLanguage } from '../i18n/LanguageContext'

function Home() {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000, type: 'mouse' })
  const titleRef = useRef(null)
  const { t } = useLanguage()

  const handlePointerMove = (event) => {
    setMousePos({
      x: event.clientX,
      y: event.clientY,
      type: event.pointerType || 'mouse'
    })
  }

  const handleTouchMove = (event) => {
    const touch = event.touches[0]
    if (!touch) return

    setMousePos({
      x: touch.clientX,
      y: touch.clientY,
      type: 'touch'
    })
  }

  return (
    <>
      <ParticleBackground mousePos={mousePos} hideAtRef={titleRef} />
      <div className="home-page">
        <main
          className="home-hero"
          onPointerMove={handlePointerMove}
          onTouchMove={handleTouchMove}
        >
          <h1 ref={titleRef} className="home-title">
            {t.home.title}
          </h1>

          <p className="home-subtitle">
            {t.home.subtitle}
          </p>

          <div className="home-status-grid">
            <PixelCard style={{ flex: 1, textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginBottom: '8px' }}>// {t.home.status.projects}</div>
              <div style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text)' }}>
                {homeData.status.projects}
              </div>
            </PixelCard>
            <PixelCard style={{ flex: 1, textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginBottom: '8px' }}>// {t.home.status.experience}</div>
              <div style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: 'bold', color: 'var(--color-text)' }}>
                {homeData.status.experience}
              </div>
            </PixelCard>
            <PixelCard style={{ flex: 1, textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'monospace', marginBottom: '8px' }}>// {t.home.status.stack}</div>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text)' }}>
                {homeData.status.stack}
              </div>
            </PixelCard>
          </div>

          <PixelButton>{t.home.viewProjects}</PixelButton>
        </main>
      </div>
    </>
  )
}

export default Home
