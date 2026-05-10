import { useLayoutEffect, useRef, useState } from 'react'
import { useAvatarReveal } from '../components/AvatarRevealContext'
import ParticleBackground from '../components/ParticleBackground'
import PixelButton from '../components/PixelButton'
import TerminalCard from '../components/TerminalCard'
import { useBTTerminal } from '../components/BTTerminalContext'
import { useLanguage } from '../i18n/LanguageContext'

function Home() {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000, type: 'mouse' })
  const titleRef = useRef(null)
  const { isAvatarRevealed, resetAvatarReveal, revealAvatar } = useAvatarReveal()
  const { enableBTTerminal } = useBTTerminal()
  const { t } = useLanguage()

  const handleEmbark = () => {
    enableBTTerminal()
  }

  useLayoutEffect(() => {
    resetAvatarReveal()
  }, [resetAvatarReveal])

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

          {isAvatarRevealed && (
            <PixelButton onClick={handleEmbark}>
              {t.home.viewProjects}
            </PixelButton>
          )}
        </main>
      </div>
    </>
  )
}

export default Home
