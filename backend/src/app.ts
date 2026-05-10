import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import healthRouter from './routes/health.js'
import siteRouter from './routes/site.js'
import graphRouter from './routes/graph.js'

export const app = express()

app.use(cors({ origin: env.corsOrigin }))
app.use(express.json())

app.get('/api', (_request, response) => {
  response.json({ ok: true, service: 'myweb-backend' })
})

app.use('/api/health', healthRouter)
app.use('/api/site', siteRouter)
app.use('/api/graph', graphRouter)
