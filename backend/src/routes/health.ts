import { Router } from 'express'
import { checkDatabase } from '../db/pool.js'

const router = Router()

router.get('/', async (_request, response) => {
  try {
    const database = await checkDatabase()

    response.json({
      ok: true,
      service: 'myweb-backend',
      database,
      time: new Date().toISOString()
    })
  } catch (error) {
    response.status(503).json({
      ok: false,
      service: 'myweb-backend',
      database: { configured: true, ok: false },
      message: error instanceof Error ? error.message : 'Database check failed'
    })
  }
})

export default router
