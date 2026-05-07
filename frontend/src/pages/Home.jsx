import PixelCard from '../components/PixelCard'
import PixelButton from '../components/PixelButton'
import SectionTitle from '../components/SectionTitle'
import StatusBox from '../components/StatusBox'
import homeData from '../data/home.json'

function Home() {
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
  )
}

export default Home