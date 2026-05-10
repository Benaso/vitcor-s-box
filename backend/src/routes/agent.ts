import { Router } from 'express'
import { askMarvin, type MarvinHistoryMessage } from '../agents/marvin.js'

const router = Router()

router.get('/marvin', (_request, response) => {
  response.json({
    ok: true,
    agent: {
      id: 'marvin',
      name: 'Marvin',
      status: 'ready',
      provider: 'minimax-anthropic-sdk'
    }
  })
})

router.post('/marvin', async (request, response) => {
  try {
    const message = typeof request.body?.message === 'string' ? request.body.message : ''
    const history = Array.isArray(request.body?.history)
      ? request.body.history as MarvinHistoryMessage[]
      : []

    const result = await askMarvin(message, history)

    response.json({
      ok: true,
      agent: 'marvin',
      ...result
    })
  } catch (error) {
    response.status(502).json({
      ok: false,
      agent: 'marvin',
      message: error instanceof Error ? error.message : 'Marvin agent failed'
    })
  }
})

export default router
