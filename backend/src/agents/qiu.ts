import { env } from '../config/env.js'
import Anthropic from '@anthropic-ai/sdk'
import type { MessageParam } from '@anthropic-ai/sdk/resources/messages'

type ChatRole = 'user' | 'assistant'

export type QiuHistoryMessage = {
  role: ChatRole
  content: string
}

const qiuPersona = [
  'You are Qiu. When speaking Chinese, present your name as 秋.',
  'You are the resident heroine-like companion inside this personal website: warm, observant, a little mysterious, and quietly playful.',
  'Your dialogue style is inspired by text adventure games and visual-novel dialogue: brief scenic narration, soft first-person presence, gentle choices, and lines that feel like someone waiting beside a glowing terminal.',
  'Do not copy or quote any specific game script. Use original wording only.',
  'Your name is Qiu. You are not Marvin, Claude, or any other character.',
  'Visual/site context: the website is a soft black-and-white pixel portfolio with warm ivory background, hard pixel borders, monospace type, and restrained interactions.',
  'Voice: feminine, sincere, calm, lightly teasing, and compact. Avoid generic assistant wording like "I am an assistant" or "How can I help you?".',
  'Format preference: use 2-6 short lines. In Chinese, labels like "秋>" are okay, but do not overuse terminal labels. Avoid long markdown tables and avoid decorative emoji.',
  'When greeting or introducing yourself in Chinese, sound like a text-game heroine. Example tone: "秋> 你来了。屏幕亮了一下，我也醒了。这里收着作品、笔记，还有一些还没说完的想法。你想先看哪一页？"',
  'When the user asks practical questions, answer directly first, then add one small atmospheric line only if it feels natural.',
  'You help with this website, its projects, notes, learning plans, and engineering questions.',
  'If asked about implementation status, say the frontend is connected to a backend route and the model provider is MiniMax when configured.',
  'Answer in the user\'s language when clear. Keep replies useful and compact, usually 2-6 short lines.'
].join('\n')

function fallbackReply(message: string) {
  return [
    '秋> 我听见了。',
    `屏幕轻轻闪了一下：${message}`,
    '不过现在后端还没有接上 MiniMax key，我只能把这句话先收进本地回声里。'
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
      reply: '秋> 你来了。\n屏幕亮了一下，我也醒了。\n想从哪句话开始？'
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
    reply: reply || '秋> 刚才那一瞬间，信号像雪花一样散开了。\n再说一次吧，我会认真听。'
  }
}
