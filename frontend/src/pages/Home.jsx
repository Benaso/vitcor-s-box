import { useRef, useState } from 'react'
import { useAvatarReveal } from '../components/AvatarRevealContext'
import ParticleBackground from '../components/ParticleBackground'
import TerminalCard from '../components/TerminalCard'
import { useLanguage } from '../i18n/LanguageContext'

function Home() {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000, type: 'mouse' })
  const titleRef = useRef(null)
  const { hasEverRevealed, revealAvatar } = useAvatarReveal()
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
      <ParticleBackground
        mousePos={mousePos}
        hideAtRef={titleRef}
        hasRevealed={hasEverRevealed}
        onDisperseChange={(shouldDisperse) => {
          if (shouldDisperse) {
            revealAvatar()
          }
        }}
      />
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

          <TerminalCard command={t.home.terminal} />
        </main>
      </div>
    </>
  )
}

export default Home
