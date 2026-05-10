import { useEffect, useState } from 'react'

const BOOT_LINES = [
  { label: 'POST memory check', value: '2048 MB OK' },
  { label: 'mount /dev/marvin-core', value: 'READY' },
  { label: 'load personality matrix', value: 'OK' },
  { label: 'attach dialogue device', value: 'OK' },
  { label: 'calibrate empathy bus', value: 'OK' },
  { label: 'start agent-shell.service', value: 'ONLINE' },
  { label: 'handoff to marvin@tty0', value: 'READY' }
]

function BTBootSequence({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    if (visibleLines < BOOT_LINES.length) {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => prev + 1)
      }, 320)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      onComplete?.()
    }, 650)
    return () => clearTimeout(timer)
  }, [visibleLines, onComplete])

  return (
    <div className="bt-boot-sequence">
      <div className="bt-boot-sequence__screen" aria-label="Marvin virtual machine boot sequence">
        <div className="bt-boot-sequence__bios">
          <strong>marvin boot</strong>
          <span>/agent/local</span>
        </div>
        <div className="bt-boot-sequence__meta">
          <span>GUEST: MRVN</span>
          <span>MODE: SAFE BOOT</span>
          <span>DISPLAY: TTY0</span>
        </div>
        <div className="bt-boot-sequence__log">
          {BOOT_LINES.slice(0, visibleLines).map((line) => (
            <div key={line.label} className="bt-boot-sequence__line">
              <span className="bt-boot-sequence__text">
                <span className="bt-boot-sequence__prompt">&gt;</span>
                {line.label}
              </span>
              <span className="bt-boot-sequence__status">[{line.value}]</span>
            </div>
          ))}
          {visibleLines < BOOT_LINES.length && (
            <span className="bt-boot-sequence__cursor">_</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default BTBootSequence
