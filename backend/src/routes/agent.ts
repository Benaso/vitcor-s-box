import { Router } from 'express'
import { askQiu, type QiuHistoryMessage } from '../agents/qiu.js'

const router = Router()

router.get('/qiu', (_request, response) => {
  response.json({
    ok: true,
    agent: {
      id: 'qiu',
      name: 'Qiu',
      status: 'ready',
      provider: 'minimax-anthropic-sdk'
    }
  })
})

router.post('/qiu', async (request, response) => {
  try {
    const message = typeof request.body?.message === 'string' ? request.body.message : ''
    const history = Array.isArray(request.body?.history)
      ? request.body.history as QiuHistoryMessage[]
      : []

    const result = await askQiu(message, history)

    response.json({
      ok: true,
      agent: 'qiu',
      ...result
    })
  } catch (error) {
    response.status(502).json({
      ok: false,
      agent: 'qiu',
      message: error instanceof Error ? error.message : 'Qiu agent failed'
    })
  }
})

export default router
