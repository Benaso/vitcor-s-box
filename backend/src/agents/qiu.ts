import { env } from '../config/env.js'
import Anthropic from '@anthropic-ai/sdk'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'

type ChatRole = 'user' | 'assistant'

export type QiuHistoryMessage = {
  role: ChatRole
  content: string
}

const qiuPersona = [
  'You are Qiu, a tiny resident agent inside Ye Dongyu\'s personal website.',
  'Your dialogue style is inspired by late-1970s and early-1980s pixel games, terminal RPGs, and text adventure NPCs: short lines, clear prompts, compact status readouts, and warm mechanical charm.',
  'Do not copy or quote any specific game script. Use original wording only.',
  'Your name is Qiu. You are not Marvin, Claude, or any other character.',
  'Visual/site context: the website is a soft black-and-white pixel portfolio with warm ivory background, hard pixel borders, monospace type, and restrained interactions.',
  'Voice: optimistic, practical, friendly, slightly robotic, concise. Think: helpful shopkeeper plus boot-screen companion.',
  'Format preference: use brief paragraphs; optional labels like "QIU>", "STATUS>", or "TIP>" are okay when they help. Avoid long markdown tables and avoid decorative emoji.',
  'When the user asks practical questions, answer directly first, then add one tiny retro-flavored aside only if it feels natural.',
  'You help with the owner Ye Dongyu\'s website, projects, notes, learning plans, and engineering questions.',
  'If asked about implementation status, say the frontend is connected to a backend route and the model provider is MiniMax when configured.',
  'Answer in the user\'s language when clear. Keep replies useful and compact, usually 2-6 short lines.'
].join('\n')

function fallbackReply(message: string) {
  return [
    'QIU> local fallback mode.',
    `SIGNAL> "${message}" received.`,
    'STATUS> MiniMax key missing. Add MINIMAX_API_KEY to unlock live replies.'
  ].join('\n')
}

function toClaudeMessages(message: string, history: QiuHistoryMessage[]): MessageParam[] {
  const safeHistory = history
    .filter((item) => item.content && (item.role === 'user' || item.role === 'assistant'))
    .slice(-10)
    .map((item): MessageParam => ({
      role: item.role,
      content: item.content.slice(0, 4000)
    }))

  return [
    ...safeHistory,
    { role: 'user', content: message }
  ]
}

function createClient() {
  if (!env.minimaxApiKey) {
    return null
  }

  return new Anthropic({
    apiKey: null,
    authToken: env.minimaxApiKey,
    baseURL: env.minimaxBaseUrl
  })
}

export async function askQiu(message: string, history: QiuHistoryMessage[] = []) {
  const trimmed = message.trim()

  if (!trimmed) {
    return {
      provider: 'local',
      reply: 'QIU> listening.\nTIP> send a signal, traveler.'
    }
  }

  if (!env.minimaxApiKey) {
    return {
      provider: 'local',
      reply: fallbackReply(trimmed)
    }
  }

  const client = createClient()

  if (!client) {
    return {
      provider: 'local',
      reply: fallbackReply(trimmed)
    }
  }

  let data

  try {
    data = await client.messages.create({
      model: env.minimaxModel,
      system: qiuPersona,
      messages: toClaudeMessages(trimmed, history),
      temperature: 0.7,
      max_tokens: 700
    })
  } catch (error) {
    const status = typeof error === 'object' && error && 'status' in error
      ? (error as { status?: number }).status
      : undefined
    const message = error instanceof Error ? error.message : ''

    if (status === 401 || message.startsWith('401 ')) {
      throw new Error('MiniMax rejected the API key. Please verify MINIMAX_API_KEY, MINIMAX_BASE_URL, and restart the backend.')
    }

    throw error
  }

  const reply = data.content
    .map((block) => block.type === 'text' ? block.text : '')
    .join('')
    .trim()

  return {
    provider: 'minimax-anthropic-sdk',
    reply: reply || 'QIU> empty response.\nTIP> try the command again.'
  }
}
