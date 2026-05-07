import { useEffect, useState } from 'react'
import PixelCard from '../components/PixelCard'
import PixelButton from '../components/PixelButton'
import SectionTitle from '../components/SectionTitle'
import StatusBox from '../components/StatusBox'

function Home() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/home')
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <PixelCard style={{ marginBottom: '24px' }}>
        <SectionTitle>INTRO</SectionTitle>
        <h1
          style={{
            fontFamily: 'monospace',
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '16px',
            lineHeight: '1.4'
          }}
        >
          HELLO<br />WORLD
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: '1.8', marginBottom: '24px' }}>
          {data.profile.title}<br />
          {data.profile.bio}
        </p>
        <PixelButton>VIEW PROJECTS ▶</PixelButton>
      </PixelCard>

      <PixelCard>
        <SectionTitle>STATUS</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <StatusBox label="PROJECTS" value={data.status.projects} />
          <StatusBox label="EXPERIENCE" value={data.status.experience} />
          <StatusBox label="STACK" value={data.status.stack} />
        </div>
      </PixelCard>
    </div>
  )
}

export default Home