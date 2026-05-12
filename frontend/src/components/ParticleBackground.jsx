import { useEffect, useRef } from 'react'
import avatarImageSrc from '../../static_res/vvictor.png'

const codePool = [
  '{', '}', '[', ']', '(', ')', '<', '>', '/', '*', ';', ':', '"', "'",
  'const', 'let', 'var', 'function', 'if', 'else', 'return', 'async', 'await',
  '=>', '===', '!==', '&&', '||', '++', '--', 'import', 'export', 'from',
  'fn', 'let', 'mut', 'pub', 'impl', 'trait', 'struct', 'enum', 'match',
  'Option', 'Result', 'Some', 'None', 'Ok', 'Err', 'unwrap', 'expect',
  'func', 'go', 'defer', 'chan', 'goroutine', 'interface', 'map', 'make',
  'package', 'import', 'return', 'nil', 'true', 'false', 'append', 'range',
  'public', 'private', 'class', 'static', 'void', 'int', 'String', 'new',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
]

function ParticleBackground({ mousePos, hideAtRef, hasRevealed = false, onDisperseChange }) {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const mousePosRef = useRef(mousePos)
  const hasRevealedRef = useRef(hasRevealed)
  const disperseRef = useRef(false)

  useEffect(() => {
    mousePosRef.current = mousePos
  }, [mousePos])

  useEffect(() => {
    hasRevealedRef.current = hasRevealed
  }, [hasRevealed])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []
    let codeParticles = []
    let imageLoaded = false
    let avatarCenter = null

    const getAvatarLayout = () => {
      const navRect = document.querySelector('.site-nav')?.getBoundingClientRect()

      if (window.innerWidth < 768) {
        const size = window.innerWidth < 360 ? 156 : 176
        const navBottom = navRect ? navRect.bottom : 56

        return {
          mode: 'mobile',
          size,
          centerX: window.innerWidth / 2,
          centerY: navBottom + 8 + size / 2,
          disperseTriggerOffset: 16
        }
      }

      if (window.innerWidth < 1024) {
        const size = 240
        const navBottom = navRect ? navRect.bottom : 76

        return {
          mode: 'tablet',
          size,
          centerX: window.innerWidth / 2,
          centerY: navBottom + 24 + size / 2,
          disperseTriggerOffset: 32
        }
      }

      const size = 280
      const navBottom = navRect ? navRect.bottom : 76

      return {
        mode: 'desktop',
        size,
        centerX: window.innerWidth / 2,
        centerY: navBottom + 48 + size / 2,
        disperseTriggerOffset: 96
      }
    }

    let avatarLayout = getAvatarLayout()
    let avatarSize = avatarLayout.size
    let avatarMode = avatarLayout.mode
    const mouseInfluenceRadius = 28
    const touchInfluenceRadius = 44

    const getAvatarCenter = () => {
      avatarLayout = getAvatarLayout()
      avatarSize = avatarLayout.size
      avatarMode = avatarLayout.mode

      return {
        x: avatarLayout.centerX,
        y: avatarLayout.centerY
      }
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      avatarLayout = getAvatarLayout()
      avatarSize = avatarLayout.size
      avatarMode = avatarLayout.mode
    }

    class Particle {
      constructor(x, y, color) {
        this.originX = x
        this.originY = y
        this.x = x
        this.y = y
        this.color = color
        this.size = 2
        this.speed = 0.08
        this.opacity = 0.95
        const angle = Math.random() * Math.PI * 2
        const distance = 80 + Math.random() * 140
        this.disperseX = x + Math.cos(angle) * distance
        this.disperseY = y + Math.sin(angle) * distance
      }

      update(mouseX, mouseY, shouldDisperse, influenceRadius) {
        if (shouldDisperse) {
          this.x += (this.disperseX - this.x) * 0.035
          this.y += (this.disperseY - this.y) * 0.035
          this.opacity += (0 - this.opacity) * 0.045
          return
        }

        const dx = mouseX - this.x
        const dy = mouseY - this.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < influenceRadius) {
          const force = (influenceRadius - dist) / influenceRadius
          const angle = Math.atan2(dy, dx)
          this.x -= Math.cos(angle) * force * 18
          this.y -= Math.sin(angle) * force * 18
          this.opacity = 0.15 + (1 - force) * 0.4
        } else {
          this.x += (this.originX - this.x) * this.speed
          this.y += (this.originY - this.y) * this.speed
          this.opacity += (0.95 - this.opacity) * 0.08
        }
      }

      draw() {
        ctx.fillStyle = this.color
        ctx.globalAlpha = this.opacity
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size)
        ctx.globalAlpha = 1
      }
    }

    class CodeParticle {
      constructor(x, y, text) {
        this.originX = x
        this.originY = y
        this.x = x
        this.y = y
        this.codeText = text
        this.opacity = hasRevealedRef.current ? 0.68 : 0
        this.maxOpacity = 0.68
        this.floatSpeed = 0.3 + Math.random() * 0.5
        this.amplitude = 20 + Math.random() * 40
        this.phase = Math.random() * Math.PI * 2
        this.size = 14
        this.speedX = 0.2 + Math.random() * 0.3
      }

      update(shouldAppear) {
        if (shouldAppear) {
          this.opacity += (this.maxOpacity - this.opacity) * 0.008
        }

        this.phase += this.floatSpeed * 0.05
        this.y += Math.sin(this.phase) * this.amplitude * 0.02
        this.x += Math.cos(this.phase * 0.5) * this.amplitude * 0.015

        if (this.x < -50) this.x = canvas.width + 50
        if (this.x > canvas.width + 50) this.x = -50
        if (this.y < -50) this.y = canvas.height + 50
        if (this.y > canvas.height + 50) this.y = -50
      }

      draw() {
        if (this.opacity < 0.02) return
        ctx.font = `${this.size}px monospace`
        ctx.fillStyle = `rgba(18, 18, 18, ${this.opacity})`
        ctx.fillText(this.codeText, this.x, this.y)
      }
    }

    const loadImage = () => {
      const img = imageRef.current
      if (!img.complete || imageLoaded) return
      imageLoaded = true

      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')

      tempCanvas.width = avatarSize
      tempCanvas.height = avatarSize

      tempCtx.clearRect(0, 0, avatarSize, avatarSize)

      const cropSize = Math.min(img.width * 0.72, img.height * 0.58)
      const focalX = img.width * 0.5
      const focalY = img.height * 0.42
      const sourceX = Math.max(0, Math.min(img.width - cropSize, focalX - cropSize / 2))
      const sourceY = Math.max(0, Math.min(img.height - cropSize, focalY - cropSize / 2))

      tempCtx.drawImage(
        img,
        sourceX,
        sourceY,
        cropSize,
        cropSize,
        0,
        0,
        avatarSize,
        avatarSize
      )

      const imageData = tempCtx.getImageData(0, 0, avatarSize, avatarSize)
      const data = imageData.data

      particles = []
      const spacing = 3

      if (!avatarCenter) {
        avatarCenter = getAvatarCenter()
      }

      const centerX = avatarCenter.x
      const centerY = avatarCenter.y

      const getBrightness = (x, y) => {
        const clampedX = Math.max(0, Math.min(avatarSize - 1, x))
        const clampedY = Math.max(0, Math.min(avatarSize - 1, y))
        const i = (clampedY * avatarSize + clampedX) * 4
        return (data[i] + data[i + 1] + data[i + 2]) / 3
      }

      for (let y = 0; y < avatarSize; y += spacing) {
        for (let x = 0; x < avatarSize; x += spacing) {
          const i = (y * avatarSize + x) * 4
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]

          if (a > 128) {
            const brightness = (r + g + b) / 3
            const rightBrightness = getBrightness(x + spacing, y)
            const lowerBrightness = getBrightness(x, y + spacing)
            const edgeStrength = Math.abs(brightness - rightBrightness) + Math.abs(brightness - lowerBrightness)
            const centerOffsetX = (x - avatarSize / 2) / (avatarSize / 2)
            const centerOffsetY = (y - avatarSize / 2) / (avatarSize / 2)
            const withinAvatarMask = centerOffsetX * centerOffsetX + centerOffsetY * centerOffsetY < 0.98
            const isFigurePixel = brightness < 188 || edgeStrength > 18
            const isHighlightDetail = brightness < 224 && edgeStrength > 8 && Math.random() > 0.45

            if (!withinAvatarMask || (!isFigurePixel && !isHighlightDetail)) continue

            const contrasted = (brightness - 128) * 1.55 + 128
            const tone = Math.max(0, Math.min(245, Math.round(contrasted - edgeStrength * 0.5)))
            particles.push(new Particle(
              centerX - avatarSize / 2 + x,
              centerY - avatarSize / 2 + y,
              `rgb(${tone}, ${tone}, ${tone})`
            ))
          }
        }
      }

      // 初始化 code 粒子
      const codeCount = window.innerWidth >= 1024 ? 40 : window.innerWidth >= 768 ? 30 : 20
      for (let i = 0; i < codeCount; i++) {
        const text = codePool[Math.floor(Math.random() * codePool.length)]
        const startX = Math.random() * canvas.width
        const startY = Math.random() * canvas.height
        codeParticles.push(new CodeParticle(startX, startY, text))
      }
    }

    const draw = () => {
      ctx.fillStyle = '#f5f2eb'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const titleTop = hideAtRef?.current?.getBoundingClientRect().top
      const avatarBottom = avatarCenter ? avatarCenter.y + avatarSize / 2 : 0
      const siteMainEl = document.querySelector('.site-main')
      const hasScrolled = window.scrollY > 8 || (siteMainEl ? siteMainEl.scrollTop > 8 : false)
      const shouldDisperseAvatar = (
        hasScrolled
        &&
        typeof titleTop === 'number'
        && avatarBottom + avatarLayout.disperseTriggerOffset >= titleTop
      )

      if (disperseRef.current !== shouldDisperseAvatar) {
        disperseRef.current = shouldDisperseAvatar
        if (shouldDisperseAvatar) {
          hasRevealedRef.current = true
        }
        onDisperseChange?.(shouldDisperseAvatar)
      }

      particles.forEach(p => {
        const { x, y, type } = mousePosRef.current
        const influenceRadius = type === 'touch' ? touchInfluenceRadius : mouseInfluenceRadius
        p.update(x, y, shouldDisperseAvatar, influenceRadius)
        if (p.opacity > 0.01) {
          p.draw()
        }
      })

      // 更新和绘制 code 粒子
      const shouldCodeAppear = hasRevealedRef.current || (hasScrolled && typeof titleTop === 'number' && avatarBottom + avatarLayout.disperseTriggerOffset >= titleTop)
      codeParticles.forEach(cp => {
        cp.update(shouldCodeAppear)
        cp.draw()
      })

      animationId = requestAnimationFrame(draw)
    }

    resize()
    const img = imageRef.current
    if (img.complete) {
      loadImage()
    }

    draw()

    const handleImageLoad = () => {
      loadImage()
    }

    img.addEventListener('load', handleImageLoad)

    const handleResize = () => {
      const previousMode = avatarMode
      const nextCenter = getAvatarCenter()
      const dx = avatarCenter ? nextCenter.x - avatarCenter.x : 0
      const dy = avatarCenter ? nextCenter.y - avatarCenter.y : 0

      resize()

      if (previousMode !== avatarMode) {
        avatarCenter = nextCenter
        imageLoaded = false
        codeParticles = []
        loadImage()
        return
      }

      if (avatarCenter && (dx || dy)) {
        particles.forEach((particle) => {
          particle.originX += dx
          particle.originY += dy
          particle.x += dx
          particle.y += dy
          particle.disperseX += dx
          particle.disperseY += dy
        })
      }

      avatarCenter = nextCenter
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      img.removeEventListener('load', handleImageLoad)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <img
        ref={imageRef}
        src={avatarImageSrc}
        style={{ display: 'none' }}
        alt=""
      />
    </>
  )
}

export default ParticleBackground
