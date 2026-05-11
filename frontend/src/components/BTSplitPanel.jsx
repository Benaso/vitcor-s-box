import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAvatarReveal } from './AvatarRevealContext'
import { useBTTerminal } from './BTTerminalContext'
import { useLanguage } from '../i18n/LanguageContext'
import BTBootSequence from './BTBootSequence'
import BTGlobalTerminal from './BTGlobalTerminal'
import './BTSplitPanel.css'

const FRICTION = 0.92
const VELOCITY_THRESHOLD = 50
const SAMPLE_SIZE = 5
const DOCK_ZONE_SIZE = 60

const PIXEL_ROBOT_SRC = `${import.meta.env.BASE_URL}images/pixel-art.png`

function isInDockZone(x, y, vw, vh) {
  const mobile = vw < 768
  if (y < DOCK_ZONE_SIZE) return 'top'
  if (y > vh - DOCK_ZONE_SIZE) return 'bottom'
  if (!mobile && x < DOCK_ZONE_SIZE) return 'left'
  if (!mobile && x > vw - DOCK_ZONE_SIZE) return 'right'
  return null
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

function useDraggableHandle({ onSnap }) {
  const handleRef = useRef(null)
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const [isDragging, setIsDragging] = useState(false)
  const [renderTick, setRenderTick] = useState(0)
  const samples = useRef([])
  const pointerId = useRef(null)
  const animRef = useRef(null)
  const onSnapRef = useRef(onSnap)
  const hoveredZone = useRef(null)
  const initialized = useRef(false)
  onSnapRef.current = onSnap

  const forceRender = useCallback(() => setRenderTick(t => t + 1), [])

  const getHandleHalf = useCallback(() => {
    const el = handleRef.current
    if (el) return { hw: el.offsetWidth / 2, hh: el.offsetHeight / 2 }
    return { hw: 40, hh: 30 }
  }, [])

  const clampPos = useCallback((x, y) => {
    const { hw, hh } = getHandleHalf()
    return {
      x: clamp(x, hw, window.innerWidth - hw),
      y: clamp(y, hh, window.innerHeight - hh)
    }
  }, [getHandleHalf])

  const setInitialPos = useCallback((x, y) => {
    if (initialized.current) return
    initialized.current = true
    pos.current = clampPos(x, y)
    forceRender()
  }, [clampPos, forceRender])

  const snapToEdgeCenter = useCallback((edge) => {
    const { hw, hh } = getHandleHalf()
    const vw = window.innerWidth
    const vh = window.innerHeight
    if (edge === 'bottom') pos.current = { x: vw / 2, y: vh - hh }
    else if (edge === 'top') pos.current = { x: vw / 2, y: hh }
    else if (edge === 'left') pos.current = { x: hw, y: vh / 2 }
    else if (edge === 'right') pos.current = { x: vw - hw, y: vh / 2 }
  }, [getHandleHalf])

  const animateInertia = useCallback((vx, vy) => {
    const { hw, hh } = getHandleHalf()
    const vw = window.innerWidth
    const vh = window.innerHeight

    const tick = () => {
      vx *= FRICTION
      vy *= FRICTION

      const nx = pos.current.x + vx / 60
      const ny = pos.current.y + vy / 60
      const clamped = {
        x: clamp(nx, hw, vw - hw),
        y: clamp(ny, hh, vh - hh)
      }

      const stopped = Math.abs(vx) < VELOCITY_THRESHOLD && Math.abs(vy) < VELOCITY_THRESHOLD
      const hitEdge =
        clamped.x <= hw || clamped.x >= vw - hw ||
        clamped.y <= hh || clamped.y >= vh - hh

      const zone = isInDockZone(clamped.x, clamped.y, vw, vh)
      if (zone) {
        pos.current = clamped
        forceRender()
        snapToEdgeCenter(zone)
        forceRender()
        onSnapRef.current(zone)
        animRef.current = null
        return
      }

      if (stopped || hitEdge) {
        // Not in dock zone — just stop here
        pos.current = clamped
        forceRender()
        animRef.current = null
        return
      }

      pos.current = clamped
      forceRender()
      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
  }, [getHandleHalf, forceRender, snapToEdgeCenter])

  const onPointerDown = useCallback((e) => {
    e.preventDefault()
    pointerId.current = e.pointerId
    e.currentTarget.setPointerCapture(e.pointerId)
    samples.current = [{ x: e.clientX, y: e.clientY, t: Date.now() }]
    hoveredZone.current = null
    setIsDragging(true)
    if (animRef.current) {
      cancelAnimationFrame(animRef.current)
      animRef.current = null
    }
  }, [])

  const onPointerMove = useCallback((e) => {
    if (pointerId.current === null) return
    const { hw, hh } = getHandleHalf()
    const clamped = {
      x: clamp(e.clientX, hw, window.innerWidth - hw),
      y: clamp(e.clientY, hh, window.innerHeight - hh)
    }
    pos.current = clamped
    hoveredZone.current = isInDockZone(e.clientX, e.clientY, window.innerWidth, window.innerHeight)
    samples.current.push({ x: e.clientX, y: e.clientY, t: Date.now() })
    if (samples.current.length > SAMPLE_SIZE) samples.current.shift()
    forceRender()
  }, [getHandleHalf, forceRender])

  const onPointerUp = useCallback((e) => {
    if (pointerId.current === null) return
    pointerId.current = null
    setIsDragging(false)

    const s = samples.current
    if (s.length < 2) {
      hoveredZone.current = null
      forceRender()
      return
    }

    const first = s[0]
    const last = s[s.length - 1]
    const dt = (last.t - first.t) / 1000
    if (dt < 0.01) {
      hoveredZone.current = null
      forceRender()
      return
    }

    const vx = (last.x - first.x) / dt
    const vy = (last.y - first.y) / dt
    const vw = window.innerWidth
    const vh = window.innerHeight

    const zone = isInDockZone(pos.current.x, pos.current.y, vw, vh)
    if (zone) {
      snapToEdgeCenter(zone)
      hoveredZone.current = null
      forceRender()
      onSnapRef.current(zone)
      return
    }

    if (Math.abs(vx) >= VELOCITY_THRESHOLD || Math.abs(vy) >= VELOCITY_THRESHOLD) {
      hoveredZone.current = null
      forceRender()
      animateInertia(vx, vy)
      return
    }

    // Not in zone, no velocity — just stay
    hoveredZone.current = null
    forceRender()
  }, [forceRender, snapToEdgeCenter, animateInertia])

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  useEffect(() => {
    const onResize = () => {
      pos.current = clampPos(pos.current.x, pos.current.y)
      forceRender()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [clampPos, forceRender])

  return {
    handleRef,
    hoveredZone: hoveredZone.current,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    pos: pos.current,
    renderTick,
    setInitialPos
  }
}

function DockZones({ hoveredZone }) {
  const isMobile = window.innerWidth < 768
  const zones = isMobile ? ['top', 'bottom'] : ['top', 'bottom', 'left', 'right']
  return (
    <>
      {zones.map((edge) => (
        <div
          key={edge}
          className={`bt-dock-zone bt-dock-zone--${edge}${hoveredZone === edge ? ' is-hovered' : ''}`}
        />
      ))}
    </>
  )
}

function BTSplitPanel() {
  const { hasEverRevealed, isAvatarRevealed } = useAvatarReveal()
  const { t } = useLanguage()
  const location = useLocation()
  const {
    closeBTTerminal,
    dockEdge,
    isBTTerminalOpen,
    openBTTerminal,
    setDockEdge
  } = useBTTerminal()
  const [showChat, setShowChat] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const refreshTimerRef = useRef(null)
  const bootDoneRef = useRef(false)
  const prevShouldShow = useRef(false)

  useEffect(() => {
    return () => clearTimeout(refreshTimerRef.current)
  }, [])

  const handleBootComplete = useCallback(() => {
    bootDoneRef.current = true
    setIsRefreshing(true)
    refreshTimerRef.current = setTimeout(() => {
      setShowChat(true)
      requestAnimationFrame(() => setIsRefreshing(false))
    }, 180)
  }, [])

  const handleSnap = useCallback((edge) => {
    setDockEdge(edge)
    setShowChat(false)
    bootDoneRef.current = false
    openBTTerminal()
  }, [setDockEdge, openBTTerminal])

  const handleClose = useCallback(() => {
    closeBTTerminal()
    setPanelSize(null)
  }, [closeBTTerminal])

  // --- Resize logic ---
  const [panelSize, setPanelSize] = useState(null)
  const resizeStartRef = useRef(null)

  const isVertical = dockEdge === 'bottom' || dockEdge === 'top'
  const minSize = isVertical ? 250 : 280
  const maxSize = isVertical ? window.innerHeight * 0.9 : window.innerWidth * 0.8

  const sizeStyle = panelSize
    ? isVertical
      ? { height: panelSize + 'px' }
      : { width: panelSize + 'px' }
    : undefined

  const handleEdgeDown = useCallback((e) => {
    if (e.target.closest('.bt-panel-edge__close')) return
    e.preventDefault()
    const panel = e.currentTarget.parentElement
    const rect = panel.getBoundingClientRect()
    const startSize = isVertical ? rect.height : rect.width
    resizeStartRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startSize
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }, [isVertical])

  const handleEdgeMove = useCallback((e) => {
    const r = resizeStartRef.current
    if (!r) return
    const delta = isVertical
      ? (dockEdge === 'bottom' ? -(e.clientY - r.startY) : (e.clientY - r.startY))
      : (dockEdge === 'left' ? (e.clientX - r.startX) : -(e.clientX - r.startX))
    const next = Math.round(Math.min(maxSize, Math.max(minSize, r.startSize + delta)))
    setPanelSize(next)
  }, [isVertical, dockEdge, minSize, maxSize])

  const handleEdgeUp = useCallback(() => {
    resizeStartRef.current = null
  }, [])

  const isHomePage = location.pathname === '/'
  const shouldShowPanel = isHomePage ? isAvatarRevealed : hasEverRevealed

  const {
    handleRef,
    hoveredZone,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    pos,
    setInitialPos
  } = useDraggableHandle({ onSnap: handleSnap })

  // Set initial position from TerminalCard when first appearing
  useEffect(() => {
    if (shouldShowPanel && !prevShouldShow.current) {
      const card = document.querySelector('.terminal-card')
      if (card) {
        const rect = card.getBoundingClientRect()
        setInitialPos(
          rect.left + rect.width / 2,
          rect.bottom + 40
        )
      } else {
        setInitialPos(window.innerWidth / 2, window.innerHeight / 2)
      }
    }
    prevShouldShow.current = shouldShowPanel
  }, [shouldShowPanel, setInitialPos])

  if (!shouldShowPanel) return null

  const showHandle = !isBTTerminalOpen

  return (
    <div className="bt-floating-panel">
      {showHandle && isDragging && (
        <DockZones hoveredZone={hoveredZone} />
      )}

      {showHandle && (
        <div
          ref={handleRef}
          className={`bt-floating-panel__handle${isDragging ? ' is-dragging' : ''}`}
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <img
            className="bt-floating-panel__sprite"
            src={PIXEL_ROBOT_SRC}
            alt=""
            draggable={false}
          />
        </div>
      )}

      {isBTTerminalOpen && (
        <div
          className={`bt-floating-panel__panel bt-floating-panel__panel--${dockEdge}`}
          style={sizeStyle}
        >
          <div
            className={`bt-panel-edge bt-panel-edge--${dockEdge}`}
            onPointerDown={handleEdgeDown}
            onPointerMove={handleEdgeMove}
            onPointerUp={handleEdgeUp}
          >
            <span className="bt-panel-edge__grip" aria-hidden="true">•••</span>
            <button
              className="bt-panel-edge__close"
              type="button"
              onClick={handleClose}
              aria-label={t.chat?.collapseAria ?? 'Collapse dialogue panel'}
              title={t.chat?.collapseAria ?? 'Collapse dialogue panel'}
            >
              {t.chat?.collapse ?? 'Collapse'}
            </button>
          </div>
          <div className="bt-shell-panel">
            {!showChat ? (
              <BTBootSequence onComplete={handleBootComplete} />
            ) : (
              <BTGlobalTerminal />
            )}
            {isRefreshing && <div className="bt-shell-panel__refresh" aria-hidden="true" />}
          </div>
        </div>
      )}
    </div>
  )
}

export default BTSplitPanel
