import { useState } from 'react'
import { useBTTerminal } from './BTTerminalContext'

const initialMessages = [
  { source: 'MARVIN', text: 'Marvin online. Standing by with cheerful mechanical patience.' },
  { source: 'SYS', text: 'Claude SDK agent channel pending.' },
  { source: 'LOG', text: 'MRVN frame reference accepted. Handshake calibration stable.' }
]

function createBTReply(message) {
  return `Acknowledged. "${message}" is queued for the future Marvin agent backend.`
}

function BTGlobalTerminal() {
  const {
    closeBTTerminal,
    isBTTerminalEnabled,
    isBTTerminalOpen,
    openBTTerminal
  } = useBTTerminal()
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()

    const text = draft.trim()
    if (!text) return

    setMessages((current) => [
      ...current,
      { source: 'YOU', text },
      { source: 'MARVIN', text: createBTReply(text) }
    ])
    setDraft('')
  }

  if (!isBTTerminalEnabled) {
    return null
  }

  return (
    <aside className={`bt-global-terminal ${isBTTerminalOpen ? 'is-open' : 'is-collapsed'}`} aria-label="Marvin terminal">
      {!isBTTerminalOpen && (
        <button className="bt-global-terminal__launcher" type="button" onClick={openBTTerminal}>
          MV
        </button>
      )}

      {isBTTerminalOpen && (
        <div className="bt-global-terminal__panel">
          <div className="bt-global-terminal__bar">
            <span />
            <span />
            <span />
            <strong>marvin.agent</strong>
            <em>LINK: LOCAL MOCK</em>
            <button type="button" onClick={closeBTTerminal} aria-label="Collapse Marvin terminal">
              HIDE
            </button>
          </div>

          <div className="bt-global-terminal__body">
            <aside className="bt-global-terminal__sidebar" aria-label="Marvin status">
              <div className="bt-global-terminal__eye" />
              <div>
                <div className="bt-global-terminal__protocol">MARVIN ONLINE</div>
                <div className="bt-global-terminal__chips">
                  <span>MARVIN</span>
                  <span>MRVN</span>
                </div>
              </div>
            </aside>

            <div className="bt-global-terminal__console">
              <div className="bt-global-terminal__messages">
                {messages.map((message, index) => (
                  <div key={`${message.source}-${index}`} className="bt-global-terminal__message">
                    <span>{message.source}</span>
                    <p>{message.text}</p>
                  </div>
                ))}
              </div>

              <form className="bt-global-terminal__input" onSubmit={handleSubmit}>
                <label htmlFor="bt-global-command">$</label>
                <input
                  id="bt-global-command"
                  placeholder="type a message for Marvin..."
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                />
              </form>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default BTGlobalTerminal
