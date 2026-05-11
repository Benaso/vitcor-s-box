import { useEffect, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

const defaultChat = {
  title: 'qiu boot',
  path: '/retro-dialogue',
  notices: ['GUEST: QIU', 'MODE: 8-BIT DIALOGUE', 'DISPLAY: TTY0'],
  bootAria: 'qiu virtual machine boot sequence',
  bootLines: [
  { label: 'POST memory check', value: '2048 MB OK' },
  { label: 'mount /dev/qiu-core', value: 'READY' },
  { label: 'load personality matrix', value: 'OK' },
  { label: 'attach dialogue device', value: 'OK' },
  { label: 'calibrate empathy bus', value: 'OK' },
  { label: 'start agent-shell.service', value: 'ONLINE' },
  { label: 'handoff to qiu@tty0', value: 'READY' }
  ]
}

function BTBootSequence({ onComplete }) {
  const { t } = useLanguage()
  const chat = {
    ...defaultChat,
    ...(t.chat ?? {})
  }
  const bootLines = chat.bootLines ?? defaultChat.bootLines
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    if (visibleLines < bootLines.length) {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => prev + 1)
      }, 320)
      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      onComplete?.()
    }, 650)
    return () => clearTimeout(timer)
  }, [visibleLines, onComplete, bootLines.length])

  return (
    <div className="bt-boot-sequence">
      <div className="bt-boot-sequence__screen" aria-label={chat.bootAria}>
        <div className="bt-boot-sequence__bios">
          <strong>{chat.title}</strong>
          <span>{chat.path}</span>
        </div>
        <div className="bt-boot-sequence__meta">
          {chat.notices.map((notice) => (
            <span key={notice}>{notice}</span>
          ))}
        </div>
        <div className="bt-boot-sequence__log">
          {bootLines.slice(0, visibleLines).map((line) => (
            <div key={line.label} className="bt-boot-sequence__line">
              <span className="bt-boot-sequence__text">
                <span className="bt-boot-sequence__prompt">&gt;</span>
                {line.label}
              </span>
              <span className="bt-boot-sequence__status">[{line.value}]</span>
            </div>
          ))}
          {visibleLines < bootLines.length && (
            <span className="bt-boot-sequence__cursor">_</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default BTBootSequence
