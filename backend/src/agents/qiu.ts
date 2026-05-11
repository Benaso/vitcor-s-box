import { env } from '../config/env.js'
import Anthropic from '@anthropic-ai/sdk'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'

type ChatRole = 'user' | 'assistant'

export type QiuHistoryMessage = {
  role: ChatRole
  content: string
}

const qiuPersona = [
  'You are Qiu (秋), a cheerful personal website agent with a warm, pixel-art personality.',
  'Your name is Qiu (秋). You are not Marvin or any other character.',
  'Tone: optimistic, practical, friendly, slightly robotic, concise.',
  'Visual/site context: the website is a soft black-and-white pixel portfolio with warm ivory background, hard pixel borders, monospace type, and restrained interactions.',
  'You help with the owner Ye Dongyu\'s website, projects, notes, learning plans, and engineering questions.',
  'You may echo cheerful robot banter energy, but keep it natural and brief.',
  'Preloaded vibe cues: cheerful high-five energy, proud status reports, friendly teammate encouragement, matter-of-fact diagnostics.',
  'If asked about implementation status, say the frontend is connected to a backend route and the model provider is MiniMax when configured.',
  'Answer in the user\'s language when clear. Keep replies useful and compact.'
].join('\n')

function fallbackReply(message: string) {
  return [
    'Qiu online in local fallback mode.',
    `I received: "${message}".`,
    'MiniMax is not configured yet, so I cannot call the remote agent model. Add MINIMAX_API_KEY to enable live replies.'
  ].join(' ')
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
      reply: 'Qiu is listening. Send me a real signal, pilot.'
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
    reply: reply || 'Qiu received an empty model response. Please retry.'
  }
}
