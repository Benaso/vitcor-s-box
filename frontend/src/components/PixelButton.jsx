function PixelButton({ children, onClick, variant = 'default' }) {
  const isActive = variant === 'active'

  return (
    <button
      onClick={onClick}
      style={{
        background: isActive ? 'var(--color-border)' : '#fff',
        color: isActive ? 'var(--color-bg)' : 'var(--color-text)',
        border: 'var(--border-width) solid var(--color-border)',
        padding: '10px 20px',
        fontFamily: 'inherit',
        fontSize: '14px',
        cursor: 'pointer',
        boxShadow: isActive ? 'none' : 'var(--shadow-offset) var(--shadow-offset) 0 var(--color-border)',
        transform: isActive ? 'translate(2px, 2px)' : 'none'
      }}
    >
      {children}
    </button>
  )
}

export default PixelButton