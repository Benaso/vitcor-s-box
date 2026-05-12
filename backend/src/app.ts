import cors from 'cors'
import express from 'express'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { env } from './config/env.js'
import healthRouter from './routes/health.js'
import siteRouter from './routes/site.js'
import graphRouter from './routes/graph.js'
import agentRouter from './routes/agent.js'
import projectsRouter from './routes/projects.js'
import { sandboxPool } from './services/sandbox.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Ensure uploads/tmp exists for multer
const uploadsTmp = path.resolve(__dirname, '../uploads/tmp')
if (!fs.existsSync(uploadsTmp)) fs.mkdirSync(uploadsTmp, { recursive: true })

export const app = express()

app.use(cors({ origin: env.corsOrigin }))
app.use(express.json())

// Serve uploaded files as static
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')))

app.get('/api', (_request, response) => {
  response.json({ ok: true, service: 'myweb-backend' })
})

app.use('/api/health', healthRouter)
app.use('/api/site', siteRouter)
app.use('/api/graph', graphRouter)
app.use('/api/agent', agentRouter)
app.use('/api/projects', projectsRouter)

// Sandbox stats (separate from projects)
app.get('/api/sandbox/stats', (_req, res) => {
  res.json({ ok: true, data: sandboxPool.getStats() })
})

// Start sandbox pool idle reaper
sandboxPool.start()
