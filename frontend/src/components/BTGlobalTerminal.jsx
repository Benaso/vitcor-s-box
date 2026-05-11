import { useEffect, useMemo, useRef, useState } from 'react'
import { postQiuMessage } from '../api/client'
import { useLanguage } from '../i18n/LanguageContext'

const defaultChat = {
  title: 'qiu boot',
  path: '/retro-dialogue',
  notices: ['GUEST: QIU', 'MODE: 8-BIT DIALOGUE', 'DISPLAY: TTY0'],
  initialMessages: [
  { source: 'QIU', text: 'QIU> awake.\nWelcome, traveler.' },
  { source: 'SYS', text: 'MODE> monochrome pocket terminal.' },
  { source: 'LOG', text: 'LINK> qiu cartridge seated. save lamp steady.' }
  ],
  thinkingLabel: 'QIU IS THINKING',
  thinkingSteps: ['reading signal', 'turning tiny gears', 'checking map tiles'],
  prompt: 'talk to qiu',
  sendingPrompt: 'qiu is reading the cartridge...',
  linkFailed: 'SYS> qiu link failed. Check backend logs and MiniMax key.'
}

function BTGlobalTerminal() {
  const { language, t } = useLanguage()
  const chat = useMemo(() => ({
    ...defaultChat,
    ...(t.chat ?? {})
  }), [t.chat])
  const [messages, setMessages] = useState(() => chat.initialMessages)
  const [draft, setDraft] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesRef = useRef(null)

  useEffect(() => {
    setMessages((current) => {
      const hasUserConversation = current.some((message) => message.source === 'YOU')
      return hasUserConversation ? current : chat.initialMessages
    })
  }, [chat.initialMessages, language])

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: 'smooth'
    })
  }, [messages, isSending])

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
      const history = messages
        .filter((message) => message.source === 'YOU' || message.source === 'QIU')
        .map((message) => ({
          role: message.source === 'YOU' ? 'user' : 'assistant',
          content: message.text
        }))
      const result = await postQiuMessage(text, history)

      setMessages((current) => [
        ...current,
        { source: 'QIU', text: result.reply }
      ])
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          source: 'SYS',
          text: error instanceof Error
            ? error.message
            : chat.linkFailed
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
          <strong>{chat.title}</strong>
          <em>{chat.path}</em>
        </div>
      </div>

      <div className="bt-chat-interface__body">
        <div className="bt-chat-interface__notice">
          {chat.notices.map((notice) => (
            <span key={notice}>{notice}</span>
          ))}
        </div>
        <div className="bt-chat-interface__messages" ref={messagesRef}>
          {messages.map((message, index) => (
            <div key={`${message.source}-${index}`} className="bt-chat-interface__message">
              <span className={`bt-chat-interface__source bt-chat-interface__source--${message.source.toLowerCase()}`}>
                {message.source}
              </span>
              <p>{message.text}</p>
            </div>
          ))}
          {isSending && (
            <div className="bt-chat-interface__message bt-chat-interface__message--thinking" aria-live="polite">
              <span className="bt-chat-interface__source bt-chat-interface__source--qiu">
                QIU
              </span>
              <div className="bt-chat-interface__thinking">
                <strong>{chat.thinkingLabel}</strong>
                <span aria-hidden="true" className="bt-chat-interface__thinking-dots">
                  <i />
                  <i />
                  <i />
                </span>
                <ol>
                  {chat.thinkingSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>

        <form className="bt-chat-interface__input" onSubmit={handleSubmit}>
          <label htmlFor="bt-command">&gt;</label>
          <input
            id="bt-command"
            placeholder={isSending ? chat.sendingPrompt : chat.prompt}
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
