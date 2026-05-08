import { useEffect, useRef, useState } from 'react'

function ParticleBackground({ mousePos }) {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []
    let imageLoaded = false

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
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
      }

      update(mouseX, mouseY) {
        const dx = mouseX - this.x
        const dy = mouseY - this.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 120) {
          const force = (120 - dist) / 120
          const angle = Math.atan2(dy, dx)
          this.x -= Math.cos(angle) * force * 18
          this.y -= Math.sin(angle) * force * 18
          this.opacity = 0.15 + (1 - force) * 0.4
        } else {
          this.x += (this.originX - this.x) * this.speed
          this.y += (this.originY - this.y) * this.speed
          this.opacity = 0.95
        }
      }

      draw() {
        ctx.fillStyle = this.color
        ctx.globalAlpha = this.opacity
        ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size)
        ctx.globalAlpha = 1
      }
    }

    const loadImage = () => {
      const img = imageRef.current
      if (!img.complete || imageLoaded) return
      imageLoaded = true

      const tempCanvas = document.createElement('canvas')
      const tempCtx = tempCanvas.getContext('2d')

      const avatarSize = 240
      tempCanvas.width = avatarSize
      tempCanvas.height = avatarSize

      tempCtx.fillStyle = '#f5f2eb'
      tempCtx.fillRect(0, 0, avatarSize, avatarSize)

      const scale = Math.min(avatarSize / img.width, avatarSize / img.height)
      const drawW = img.width * scale
      const drawH = img.height * scale
      const drawX = (avatarSize - drawW) / 2
      const drawY = (avatarSize - drawH) / 2

      tempCtx.drawImage(img, drawX, drawY, drawW, drawH)

      const imageData = tempCtx.getImageData(0, 0, avatarSize, avatarSize)
      const data = imageData.data

      particles = []
      const spacing = 3

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2 - 120

      for (let y = 0; y < avatarSize; y += spacing) {
        for (let x = 0; x < avatarSize; x += spacing) {
          const i = (y * avatarSize + x) * 4
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          const a = data[i + 3]

          if (a > 128) {
            const brightness = (r + g + b) / 3
            const contrast = brightness < 128 ? 30 : 180
            particles.push(new Particle(
              centerX - avatarSize / 2 + x,
              centerY - avatarSize / 2 + y,
              `rgb(${contrast}, ${contrast}, ${contrast})`
            ))
          }
        }
      }
    }

    const draw = () => {
      ctx.fillStyle = '#f5f2eb'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach(p => {
        p.update(mousePos.x, mousePos.y)
        p.draw()
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

    window.addEventListener('resize', () => {
      resize()
      loadImage()
    })

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      img.removeEventListener('load', handleImageLoad)
    }
  }, [mousePos])

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
        src="/images/vvictor.png"
        style={{ display: 'none' }}
        alt=""
      />
    </>
  )
}

export default ParticleBackground