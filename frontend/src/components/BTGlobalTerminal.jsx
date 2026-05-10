import { useState } from 'react'
import { postMarvinMessage } from '../api/client'

const initialMessages = [
  { source: 'MARVIN', text: 'Marvin online. Standing by with cheerful mechanical patience.' },
  { source: 'SYS', text: 'Claude SDK agent channel pending.' },
  { source: 'LOG', text: 'MRVN frame reference accepted. Handshake calibration stable.' }
]

function BTGlobalTerminal() {
  const [messages, setMessages] = useState(initialMessages)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const text = draft.trim()
    if (!text || isSending) return

    const nextMessages = [
      ...messages,
      { source: 'YOU', text }
    ]

    setMessages(nextMessages)
    setDraft('')
    setIsSending(true)

    try {
      const history = messages.map((message) => ({
        role: message.source === 'YOU' ? 'user' : 'assistant',
        content: message.text
      }))
      const result = await postMarvinMessage(text, history)

      setMessages((current) => [
        ...current,
        { source: 'MARVIN', text: result.reply }
      ])
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          source: 'SYS',
          text: error instanceof Error
            ? error.message
            : 'Marvin backend link failed. Check the backend logs and MiniMax key.'
        }
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="bt-chat-interface">
      <div className="bt-chat-interface__header">
        <div className="bt-chat-interface__title">
          <strong>marvin boot</strong>
          <em>/agent/local</em>
        </div>
      </div>

      <div className="bt-chat-interface__body">
        <div className="bt-chat-interface__notice">
          <span>GUEST: MRVN</span>
          <span>MODE: SAFE BOOT</span>
          <span>DISPLAY: TTY0</span>
        </div>
        <div className="bt-chat-interface__messages">
          {messages.map((message, index) => (
            <div key={`${message.source}-${index}`} className="bt-chat-interface__message">
              <span className={`bt-chat-interface__source bt-chat-interface__source--${message.source.toLowerCase()}`}>
                {message.source}
              </span>
              <p>{message.text}</p>
            </div>
          ))}
        </div>

        <form className="bt-chat-interface__input" onSubmit={handleSubmit}>
          <label htmlFor="bt-command">$</label>
          <input
            id="bt-command"
            placeholder={isSending ? 'executing request...' : 'type command or message'}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={isSending}
          />
        </form>
      </div>
    </div>
  )
}

export default BTGlobalTerminal
