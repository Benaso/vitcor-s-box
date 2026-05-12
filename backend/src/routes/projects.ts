import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from '../db/pool.js'
import { saveUploadedFiles, deleteProjectFiles, getSandboxDir } from '../services/projectStorage.js'
import { sandboxPool } from '../services/sandbox.js'
import { askQiu } from '../agents/qiu.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tmpDir = path.resolve(__dirname, '../../uploads/tmp')

const upload = multer({
  dest: tmpDir,
  limits: { fileSize: 50 * 1024 * 1024 } // 50 MB per file
})

const router = Router()

/* ------------------------------------------------------------------ */
/*  Helper: build a project row + its images/videos                    */
/* ------------------------------------------------------------------ */

async function loadProject(projectId: number) {
  if (!pool) return null

  const { rows } = await pool.query(
    'SELECT * FROM projects WHERE id = $1',
    [projectId]
  )
  if (rows.length === 0) return null

  const project = rows[0]

  const imgRes = await pool.query(
    'SELECT id, url, alt FROM project_images WHERE project_id = $1 ORDER BY id',
    [projectId]
  )
  const vidRes = await pool.query(
    'SELECT id, url, caption FROM project_videos WHERE project_id = $1 ORDER BY id',
    [projectId]
  )

  return {
    ...project,
    images: imgRes.rows,
    videos: vidRes.rows
  }
}

/* ------------------------------------------------------------------ */
/*  GET / — list all projects with images and videos                   */
/* ------------------------------------------------------------------ */

router.get('/', async (_req: any, res: any) => {
  try {
    if (!pool) {
      res.status(503).json({ error: 'Database not configured' })
      return
    }
    const db = pool

    const { rows: projects } = await db.query(
      'SELECT * FROM projects ORDER BY id'
    )

    const withMedia = await Promise.all(
      projects.map(async (p: any) => {
        const imgRes = await db.query(
          'SELECT id, url, alt FROM project_images WHERE project_id = $1 ORDER BY id',
          [p.id]
        )
        const vidRes = await db.query(
          'SELECT id, url, caption FROM project_videos WHERE project_id = $1 ORDER BY id',
          [p.id]
        )
        return { ...p, images: imgRes.rows, videos: vidRes.rows }
      })
    )

    res.json({ ok: true, data: withMedia })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to list projects' })
  }
})

/* ------------------------------------------------------------------ */
/*  GET /:id — single project                                          */
/* ------------------------------------------------------------------ */

router.get('/:id', async (req: any, res: any) => {
  try {
    if (!pool) {
      res.status(503).json({ error: 'Database not configured' })
      return
    }

    const projectId = Number(req.params.id)
    const project = await loadProject(projectId)

    if (!project) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    res.json({ ok: true, data: project })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get project' })
  }
})

/* ------------------------------------------------------------------ */
/*  POST / — create project (multipart)                                */
/* ------------------------------------------------------------------ */

router.post('/', upload.array('files', 20), async (req: any, res: any) => {
  try {
    if (!pool) {
      res.status(503).json({ error: 'Database not configured' })
      return
    }

    const { name, description, repo_url } = req.body as {
      name?: string
      description?: string
      repo_url?: string
    }

    if (!name) {
      res.status(400).json({ error: 'name is required' })
      return
    }

    const { rows } = await pool.query(
      'INSERT INTO projects (name, description, repo_url, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description ?? null, repo_url ?? null, 'idle']
    )
    const project = rows[0]

    // Handle uploaded files
    const files = req.files as Express.Multer.File[] | undefined
    if (files && files.length > 0) {
      const { images, videos } = await saveUploadedFiles(files, project.id)

      for (const url of images) {
        await pool.query(
          'INSERT INTO project_images (project_id, url) VALUES ($1, $2)',
          [project.id, url]
        )
      }
      for (const url of videos) {
        await pool.query(
          'INSERT INTO project_videos (project_id, url) VALUES ($1, $2)',
          [project.id, url]
        )
      }
    }

    const result = await loadProject(project.id)
    res.status(201).json({ ok: true, data: result })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to create project' })
  }
})

/* ------------------------------------------------------------------ */
/*  PUT /:id — update project (multipart)                              */
/* ------------------------------------------------------------------ */

router.put('/:id', upload.array('files', 20), async (req: any, res: any) => {
  try {
    if (!pool) {
      res.status(503).json({ error: 'Database not configured' })
      return
    }

    const projectId = Number(req.params.id)
    const existing = await loadProject(projectId)

    if (!existing) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    const { name, description, repo_url } = req.body as {
      name?: string
      description?: string
      repo_url?: string
    }

    await pool.query(
      'UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description), repo_url = COALESCE($3, repo_url) WHERE id = $4',
      [name ?? null, description ?? null, repo_url ?? null, projectId]
    )

    // Append new files
    const files = req.files as Express.Multer.File[] | undefined
    if (files && files.length > 0) {
      const { images, videos } = await saveUploadedFiles(files, projectId)

      for (const url of images) {
        await pool.query(
          'INSERT INTO project_images (project_id, url) VALUES ($1, $2)',
          [projectId, url]
        )
      }
      for (const url of videos) {
        await pool.query(
          'INSERT INTO project_videos (project_id, url) VALUES ($1, $2)',
          [projectId, url]
        )
      }
    }

    const result = await loadProject(projectId)
    res.json({ ok: true, data: result })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to update project' })
  }
})

/* ------------------------------------------------------------------ */
/*  DELETE /:id — delete project + stop sandbox + delete files         */
/* ------------------------------------------------------------------ */

router.delete('/:id', async (req: any, res: any) => {
  try {
    if (!pool) {
      res.status(503).json({ error: 'Database not configured' })
      return
    }

    const projectId = Number(req.params.id)
    const existing = await loadProject(projectId)

    if (!existing) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    // Stop sandbox if running
    await sandboxPool.stopByProject(projectId)

    // Delete uploaded files
    await deleteProjectFiles(projectId)

    // Delete DB records (cascading should handle images/videos if FK is set)
    await pool.query('DELETE FROM project_images WHERE project_id = $1', [projectId])
    await pool.query('DELETE FROM project_videos WHERE project_id = $1', [projectId])
    await pool.query('DELETE FROM projects WHERE id = $1', [projectId])

    res.json({ ok: true, data: { deleted: projectId } })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to delete project' })
  }
})

/* ------------------------------------------------------------------ */
/*  POST /:id/run — start sandbox: clone → analyze → start             */
/* ------------------------------------------------------------------ */

router.post('/:id/run', async (req: any, res: any) => {
  try {
    if (!pool) {
      res.status(503).json({ error: 'Database not configured' })
      return
    }

    const projectId = Number(req.params.id)
    const existing = await loadProject(projectId)

    if (!existing) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    if (!existing.repo_url) {
      res.status(400).json({ error: 'Project has no repo_url' })
      return
    }

    // Update DB status to cloning
    await pool.query('UPDATE projects SET status = $1 WHERE id = $2', ['cloning', projectId])

    // Clone repo
    let result: { sandboxId: string; status: string }
    try {
      result = await sandboxPool.run(projectId, existing.repo_url)
    } catch (err: any) {
      await pool.query('UPDATE projects SET status = $1 WHERE id = $2', ['error', projectId])
      const status = err.statusCode ?? 500
      res.status(status).json({ error: err.message ?? 'Failed to clone repository' })
      return
    }

    let command = 'npm start' // default fallback

    // If freshly cloned, ask Agent to analyze project structure
    if (result.status === 'cloned') {
      try {
        const sandboxDir = getSandboxDir(result.sandboxId)
        const fs = await import('fs/promises')
        const entries = await fs.readdir(sandboxDir)
        const fileList = entries.join(', ')

        const agentResponse = await askQiu(
          `Analyze this project structure and suggest the correct start command.\nFiles in root: ${fileList}\nOnly respond with the command to start the project, nothing else. Example: "npm start" or "pnpm dev" or "python app.py"`,
          []
        )

        const suggested = agentResponse.reply.trim()
        // Extract a plausible command from the agent response
        const cmdMatch = suggested.match(/(?:npm|yarn|pnpm|bun|python|node|deno)\s+\S+/)
        if (cmdMatch) {
          command = cmdMatch[0]
        } else if (suggested.length < 100 && !suggested.includes('\n')) {
          command = suggested
        }
      } catch {
        // Agent analysis failed, use default command
      }
    }

    // Start the sandbox
    try {
      await sandboxPool.startSandbox(result.sandboxId, command)
    } catch (err: any) {
      await pool.query('UPDATE projects SET status = $1 WHERE id = $2', ['error', projectId])
      const status = err.statusCode ?? 500
      res.status(status).json({ error: err.message ?? 'Failed to start sandbox' })
      return
    }

    // Update DB status to running
    await pool.query('UPDATE projects SET status = $1 WHERE id = $2', ['running', projectId])

    res.json({
      ok: true,
      data: {
        sandboxId: result.sandboxId,
        status: 'running',
        command
      }
    })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to run project' })
  }
})

/* ------------------------------------------------------------------ */
/*  POST /:id/stop — stop sandbox                                      */
/* ------------------------------------------------------------------ */

router.post('/:id/stop', async (req: any, res: any) => {
  try {
    if (!pool) {
      res.status(503).json({ error: 'Database not configured' })
      return
    }

    const projectId = Number(req.params.id)
    const existing = await loadProject(projectId)

    if (!existing) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    await sandboxPool.stopByProject(projectId)
    await pool.query('UPDATE projects SET status = $1 WHERE id = $2', ['idle', projectId])

    res.json({ ok: true, data: { stopped: projectId } })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to stop sandbox' })
  }
})

/* ------------------------------------------------------------------ */
/*  GET /:id/status — sandbox status + logs                            */
/* ------------------------------------------------------------------ */

router.get('/:id/status', async (req: any, res: any) => {
  try {
    if (!pool) {
      res.status(503).json({ error: 'Database not configured' })
      return
    }

    const projectId = Number(req.params.id)
    const existing = await loadProject(projectId)

    if (!existing) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    const sandbox = sandboxPool.getByProject(projectId)

    if (!sandbox) {
      res.json({
        ok: true,
        data: {
          projectId,
          status: existing.status ?? 'idle',
          running: false,
          logs: []
        }
      })
      return
    }

    sandboxPool.touch(projectId)

    res.json({
      ok: true,
      data: {
        projectId,
        sandboxId: sandbox.provider.getSandboxId(),
        status: sandbox.provider.isRunning() ? 'running' : 'stopped',
        running: sandbox.provider.isRunning(),
        startedAt: sandbox.startedAt,
        logs: sandbox.provider.getLogs()
      }
    })
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get status' })
  }
})

export default router
