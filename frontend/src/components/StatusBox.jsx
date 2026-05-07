function StatusBox({ label, value }) {
  return (
    <div
      style={{
        background: 'var(--color-bg)',
        padding: '16px',
        border: 'var(--border-width) solid var(--color-border)'
      }}
    >
      <span style={{ fontSize: '14px', color: 'var(--color-text)' }}>{label}</span>
      <span
        style={{
          fontSize: '16px',
          fontWeight: 'bold',
          float: 'right',
          color: 'var(--color-text)'
        }}
      >
        {value}
      </span>
    </div>
  )
}

export default StatusBox