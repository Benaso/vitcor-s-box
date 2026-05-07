import PixelCard from '../components/PixelCard'
import PixelButton from '../components/PixelButton'
import SectionTitle from '../components/SectionTitle'
import StatusBox from '../components/StatusBox'

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
          全栈开发者<br />
          Rust · React · WebAssembly<br />
          热爱技术与创造
        </p>
        <PixelButton>VIEW PROJECTS ▶</PixelButton>
      </PixelCard>

      <PixelCard>
        <SectionTitle>STATUS</SectionTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <StatusBox label="PROJECTS" value="10+" />
          <StatusBox label="EXPERIENCE" value="5Y" />
          <StatusBox label="STACK" value="RUST/REACT" />
        </div>
      </PixelCard>
    </div>
  )
}

export default Home