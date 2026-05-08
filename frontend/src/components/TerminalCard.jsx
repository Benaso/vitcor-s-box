import { useEffect, useState } from 'react'
import PixelCard from './PixelCard'

function TerminalCard({ command }) {
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    setVisibleCount(0)

    const timer = window.setInterval(() => {
      setVisibleCount((count) => {
        if (count >= command.length + 109) {
          return 0
        }

        return count + 1
      })
    }, 46)

    return () => window.clearInterval(timer)
  }, [command])

  return (
    <PixelCard style={{ width: '100%', maxWidth: '680px', marginBottom: '32px', padding: 0 }}>
      <div className="terminal-card__bar">
        <span />
        <span />
        <span />
        <strong>life.sh</strong>
      </div>
      <div className="terminal-card__body">
        <span className="terminal-card__prompt">$</span>
        <span>{command.slice(0, Math.min(visibleCount, command.length))}</span>
        <span className="terminal-card__cursor" />
      </div>
    </PixelCard>
  )
}

export default TerminalCard
