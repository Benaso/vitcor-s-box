import { useEffect, useRef, useState } from 'react'
import { useBTTerminal } from './BTTerminalContext'
import BTBootSequence from './BTBootSequence'
import BTGlobalTerminal from './BTGlobalTerminal'

function BTSplitPanel() {
  const {
    closeBTTerminal,
    isBTTerminalEnabled,
    isBTTerminalOpen,
    openBTTerminal
  } = useBTTerminal()
  const [showChat, setShowChat] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const refreshTimerRef = useRef(null)

  useEffect(() => {
    return () => clearTimeout(refreshTimerRef.current)
  }, [])

  const handleBootComplete = () => {
    setIsRefreshing(true)
    refreshTimerRef.current = setTimeout(() => {
      setShowChat(true)
      requestAnimationFrame(() => setIsRefreshing(false))
    }, 180)
  }

  if (!isBTTerminalEnabled) return null

  return (
    <div className={`bt-split-panel ${isBTTerminalOpen ? 'is-open' : 'is-collapsed'}`}>
      <button
        className="bt-split-panel__handle"
        type="button"
        onClick={isBTTerminalOpen ? closeBTTerminal : openBTTerminal}
        aria-expanded={isBTTerminalOpen}
      >
        <span>{isBTTerminalOpen ? 'collapse' : 'marvin shell'}</span>
        <strong>{isBTTerminalOpen ? 'v' : '^'}</strong>
      </button>
      <div className="bt-shell-panel">
        {!showChat ? (
          <BTBootSequence onComplete={handleBootComplete} />
        ) : (
          <BTGlobalTerminal />
        )}
        {isRefreshing && <div className="bt-shell-panel__refresh" aria-hidden="true" />}
      </div>
    </div>
  )
}

export default BTSplitPanel
