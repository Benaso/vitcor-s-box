function PixelCard({ children, style }) {
  return (
    <div
      style={{
        background: '#fff',
        border: 'var(--border-width) solid var(--color-border)',
        padding: '24px',
        boxShadow: 'var(--shadow-offset) var(--shadow-offset) 0 var(--color-border)',
        ...style
      }}
    >
      {children}
    </div>
  )
}

export default PixelCard