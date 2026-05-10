import { useState } from 'react'
import { useBTTerminal } from './BTTerminalContext'
import BTBootSequence from './BTBootSequence'
import BTGlobalTerminal from './BTGlobalTerminal'

function BTSplitPanel() {
  const { isSplitMode } = useBTTerminal()
  const [showChat, setShowChat] = useState(false)

  if (!isSplitMode) return null

  return (
    <div className="bt-split-panel">
      <div className="bt-split-panel__divider" />
      <div className="bt-split-panel__agent">
        {!showChat ? (
          <BTBootSequence onComplete={() => setShowChat(true)} />
        ) : (
          <BTGlobalTerminal />
        )}
      </div>
    </div>
  )
}

export default BTSplitPanel