import { useEffect, useState } from 'react'

const BOOT_LINES = [
  '> initializing marvin module...',
  '> loading personality matrix...',
  '> establishing neural link...',
  '> calibrating empathic processors...',
  '> BT-7274 protocol online',
  '> Marvin ready.'
]

function BTBootSequence({ onComplete }) {
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    if (visibleLines < BOOT_LINES.length) {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => prev + 1)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        onComplete?.()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [visibleLines, onComplete])

  return (
    <div className="bt-boot-sequence">
      {BOOT_LINES.slice(0, visibleLines).map((line, index) => (
        <div key={index} className="bt-boot-sequence__line">
          <span className="bt-boot-sequence__text">{line}</span>
          {index < BOOT_LINES.length - 1 && (
            <span className="bt-boot-sequence__status">[完成]</span>
          )}
        </div>
      ))}
      {visibleLines < BOOT_LINES.length && (
        <span className="bt-boot-sequence__cursor">▋</span>
      )}
    </div>
  )
}

export default BTBootSequence