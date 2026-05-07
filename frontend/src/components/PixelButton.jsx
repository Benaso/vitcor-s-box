import { useState } from 'react'

function PixelButton({ children, onClick, variant = 'default' }) {
  const [pressed, setPressed] = useState(false)
  const isActive = variant === 'active'

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        background: isActive ? 'var(--color-border)' : '#fff',
        color: isActive ? 'var(--color-bg)' : 'var(--color-text)',
        border: 'var(--border-width) solid var(--color-border)',
        padding: '10px 20px',
        fontFamily: 'inherit',
        fontSize: '14px',
        cursor: 'pointer',
        boxShadow: pressed || isActive
          ? 'none'
          : 'var(--shadow-offset) var(--shadow-offset) 0 var(--color-border)',
        transform: pressed || isActive ? 'translate(2px, 2px)' : 'none',
        transition: 'all 0.05s ease'
      }}
    >
      {children}
    </button>
  )
}

export default PixelButton