import { useState } from 'react'
import ParticleBackground from '../components/ParticleBackground'
import PixelCard from '../components/PixelCard'
import PixelButton from '../components/PixelButton'
import SectionTitle from '../components/SectionTitle'
import StatusBox from '../components/StatusBox'
import homeData from '../data/home.json'

function Home() {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 })

  return (
    <>
      <ParticleBackground mousePos={mousePos} />
      <div
        style={{ position: 'relative', zIndex: 1 }}
        onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <PixelCard>
              <SectionTitle>INTRO</SectionTitle>
              <h1
                style={{
                  fontFamily: 'monospace',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  marginBottom: '16px',
                  lineHeight: '1.4'
                }}
              >
                HELLO<br />WORLD
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: '1.8', marginBottom: '24px' }}>
                {homeData.profile.title}<br />
                {homeData.profile.bio}
              </p>
              <PixelButton>VIEW PROJECTS ▶</PixelButton>
            </PixelCard>

            <PixelCard>
              <SectionTitle>STATUS</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <StatusBox label="PROJECTS" value={homeData.status.projects} />
                <StatusBox label="EXPERIENCE" value={homeData.status.experience} />
                <StatusBox label="STACK" value={homeData.status.stack} />
              </div>
            </PixelCard>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
            <img
              src="/images/vvictor.png"
              alt="YE DONGYU"
              style={{
                width: '200px',
                height: '200px',
                objectFit: 'cover',
                border: '4px solid var(--color-border)',
                boxShadow: '8px 8px 0 var(--color-border)'
              }}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default Home