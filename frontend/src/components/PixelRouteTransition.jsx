import { useEffect, useRef, useState } from 'react'
import { useRouteTransition } from './RouteTransitionContext'

const transitionDuration = 980

function PixelRouteTransition() {
  const timerRef = useRef(null)
  const [isActive, setIsActive] = useState(false)
  const [activeLabel, setActiveLabel] = useState('')
  const {
    finishRouteTransition,
    isRouteTransitioning,
    transitionLabel
  } = useRouteTransition()

  useEffect(() => {
    if (!isRouteTransitioning) {
      setIsActive(false)
      return undefined
    }

    setActiveLabel(transitionLabel)
    setIsActive(true)

    timerRef.current = window.setTimeout(() => {
      setIsActive(false)
      finishRouteTransition()
    }, transitionDuration)

    return () => {
      window.clearTimeout(timerRef.current)
    }
  }, [finishRouteTransition, isRouteTransitioning, transitionLabel])

  useEffect(() => () => {
    window.clearTimeout(timerRef.current)
  }, [])

  return (
    <div
      className={`pixel-transition ${isActive ? 'is-active' : ''}`}
      aria-hidden="true"
    >
      <div className="pixel-transition__viewfinder">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="pixel-transition__exposure" />
      <div className="pixel-transition__hud pixel-transition__hud--top">
        <div className="pixel-transition__rec">
          <span />
          REC
        </div>
        <div>F-STD</div>
      </div>
      <div className="pixel-transition__hud pixel-transition__hud--bottom">
        <div>00:00:03</div>
        <div>ISO 400  F2.8</div>
      </div>
      <div className="pixel-transition__badge">
        <div className="pixel-transition__eyebrow">FILM SIMULATION</div>
        <div className="pixel-transition__title">
          {activeLabel}
        </div>
        <div className="pixel-transition__meter">
          {Array.from({ length: 8 }).map((_, index) => (
            <span key={index} style={{ '--meter-index': index }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PixelRouteTransition
