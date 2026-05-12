# Projects API + Sandbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the backend API for project CRUD (multi-image/video upload), database tables, and a sandbox system that lets visitors run project demos.

**Architecture:** Express routes + raw pg for data layer, multipart upload via `multer`, sandbox via a `SandboxProvider` interface with `ProcessSandbox` (dev) and `DockerSandbox` (prod) implementations. SandboxPool manages concurrency and idle reaping.

**Tech Stack:** Express, pg, multer, child_process, @anthropic-ai/sdk (for Agent analysis)

---

## File Structure

### New Files — Backend

| File | Purpose |
|------|---------|
| `backend/src/routes/projects.ts` | CRUD + sandbox run/stop/status endpoints |
| `backend/src/services/sandbox.ts` | SandboxProvider interface + SandboxPool singleton |
| `backend/src/services/processSandbox.ts` | ProcessSandbox implementation (child_process) |
| `backend/src/services/dockerSandbox.ts` | DockerSandbox implementation (placeholder for prod) |
| `backend/src/services/projectStorage.ts` | File upload/delete helpers for uploads/ directory |
| `backend/scripts/init-projects.ts` | DB migration: create projects + project_images + project_videos tables |

### Modified Files — Backend

| File | Change |
|------|--------|
| `backend/src/app.ts` | Register projects router + static uploads serving |
| `backend/src/config/env.ts` | Add SANDBOX_TYPE, MAX_SANDBOXES, SANDBOX_IDLE_TIMEOUT |
| `backend/package.json` | Add multer dependency |

### New Files — Frontend

| File | Purpose |
|------|---------|
| `frontend/src/api/client.js` | Add fetchProjects, fetchProject, runSandbox, stopSandbox, fetchSandboxStats |

### Modified Files — Frontend

| File | Change |
|------|--------|
| `frontend/src/pages/Projects.jsx` | Replace mock data with API calls |
| `frontend/src/i18n/translations.js` | Remove hardcoded project items (items come from API) |

---

## Task 1: Database Migration Script

**Files:**
- Create: `backend/scripts/init-projects.ts`

- [ ] **Step 1: Create the migration script**

```typescript
// backend/scripts/init-projects.ts
import pg from 'pg'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

async function main() {
  const pool = new pg.Pool({ connectionString: DATABASE_URL })

  await pool.query(`
    CREATE TABLE IF NOT EXISTS projects (
      id               SERIAL PRIMARY KEY,
      name             VARCHAR(255) NOT NULL,
      description      TEXT,
      repo_url         VARCHAR(1024),
      status           VARCHAR(20) DEFAULT 'idle',
      sandbox_id       VARCHAR(255),
      last_accessed_at TIMESTAMPTZ,
      created_at       TIMESTAMPTZ DEFAULT now(),
      updated_at       TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS project_images (
      id          SERIAL PRIMARY KEY,
      project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      url         VARCHAR(1024) NOT NULL,
      sort_order  INTEGER DEFAULT 0,
      created_at  TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS project_videos (
      id          SERIAL PRIMARY KEY,
      project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      url         VARCHAR(1024) NOT NULL,
      sort_order  INTEGER DEFAULT 0,
      created_at  TIMESTAMPTZ DEFAULT now()
    );
  `)

  console.log('Projects tables created successfully')
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 2: Run the migration**

Run: `cd backend && npx tsx scripts/init-projects.ts`
Expected: "Projects tables created successfully"

- [ ] **Step 3: Verify tables exist**

Run: `psql "$DATABASE_URL" -c "\dt project*"`
Expected: lists `projects`, `project_images`, `project_videos`

- [ ] **Step 4: Commit**

```bash
git add backend/scripts/init-projects.ts
git commit -m "feat: add projects database migration script"
```

---

## Task 2: Environment Config + Multer Dependency

**Files:**
- Modify: `backend/src/config/env.ts`
- Modify: `backend/package.json` (via pnpm add)

- [ ] **Step 1: Install multer**

Run: `cd backend && pnpm add multer && pnpm add -D @types/multer`

- [ ] **Step 2: Add sandbox env vars to config**

Read `backend/src/config/env.ts` and add these three keys after the existing `minimaxModel` line:

```typescript
  sandboxType: process.env.SANDBOX_TYPE ?? 'process',     // 'process' | 'docker'
  maxSandboxed: parseInt(process.env.MAX_SANDBOXES ?? '15', 10),
  sandboxIdleTimeout: parseInt(process.env.SANDBOX_IDLE_TIMEOUT ?? '1800000', 10), // ms, default 30 min
```

- [ ] **Step 3: Add env vars to .env file**

Append to `backend/.env`:

```
SANDBOX_TYPE=process
MAX_SANDBOXES=15
SANDBOX_IDLE_TIMEOUT=1800000
```

- [ ] **Step 4: Commit**

```bash
git add backend/src/config/env.ts backend/.env backend/package.json backend/pnpm-lock.yaml
git commit -m "feat: add sandbox config env vars and multer dependency"
```

---

## Task 3: File Storage Service

**Files:**
- Create: `backend/src/services/projectStorage.ts`

- [ ] **Step 1: Create the storage service**

```typescript
// backend/src/services/projectStorage.ts
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOADS_ROOT = path.resolve(__dirname, '../../uploads/projects')
const SANDBOX_ROOT = path.resolve(__dirname, '../../sandbox')

export function getProjectUploadDir(projectId: number) {
  return path.join(UPLOADS_ROOT, String(projectId))
}

export function getSandboxDir(sandboxId: string) {
  return path.join(SANDBOX_ROOT, sandboxId)
}

export async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true })
}

export async function saveUploadedFiles(
  files: Express.Multer.File[],
  projectId: number
): Promise<{ images: string[]; videos: string[] }> {
  const dir = getProjectUploadDir(projectId)
  await ensureDir(dir)

  const images: string[] = []
  const videos: string[] = []

  for (const file of files) {
    const dest = path.join(dir, file.originalname)
    await fs.rename(file.path, dest)
    const url = `/uploads/projects/${projectId}/${file.originalname}`
    if (file.mimetype.startsWith('video/')) {
      videos.push(url)
    } else {
      images.push(url)
    }
  }

  return { images, videos }
}

export async function deleteProjectFiles(projectId: number) {
  const dir = getProjectUploadDir(projectId)
  await fs.rm(dir, { recursive: true, force: true })
}

export async function deleteSandboxDir(sandboxId: string) {
  const dir = getSandboxDir(sandboxId)
  await fs.rm(dir, { recursive: true, force: true })
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/services/projectStorage.ts
git commit -m "feat: add project file storage service"
```

---

## Task 4: SandboxProvider Interface + ProcessSandbox

**Files:**
- Create: `backend/src/services/sandbox.ts`
- Create: `backend/src/services/processSandbox.ts`

- [ ] **Step 1: Create SandboxProvider interface + SandboxPool**

```typescript
// backend/src/services/sandbox.ts
import { env } from '../config/env.js'
import { deleteSandboxDir, getSandboxDir, ensureDir } from './projectStorage.js'

export interface SandboxProvider {
  clone(repoUrl: string, targetDir: string): Promise<void>
  start(cwd: string, command: string): Promise<void>
  stop(): Promise<void>
  getLogs(): string[]
  isRunning(): boolean
  getSandboxId(): string
}

export interface RunningSandbox {
  provider: SandboxProvider
  projectId: number
  startedAt: Date
  lastAccessedAt: Date
  logs: string[]
}

class SandboxPool {
  private instances = new Map<string, RunningSandbox>()
  private projectSandbox = new Map<number, string>() // projectId → sandboxId
  private reapTimer: ReturnType<typeof setInterval> | null = null

  constructor(
    private maxConcurrent: number = env.maxSandboxed,
    private idleTimeoutMs: number = env.sandboxIdleTimeout
  ) {}

  start() {
    this.reapTimer = setInterval(() => this.reapIdle(), 5 * 60 * 1000) // every 5 min
  }

  stop() {
    if (this.reapTimer) clearInterval(this.reapTimer)
  }

  async run(projectId: number, repoUrl: string): Promise<{ sandboxId: string; status: string }> {
    // Already running for this project?
    const existingId = this.projectSandbox.get(projectId)
    if (existingId && this.instances.has(existingId)) {
      const sb = this.instances.get(existingId)!
      sb.lastAccessedAt = new Date()
      return { sandboxId: existingId, status: 'already_running' }
    }

    // Concurrency limit
    if (this.instances.size >= this.maxConcurrent) {
      throw Object.assign(new Error('Max concurrent sandboxes reached'), { statusCode: 429 })
    }

    const { createProvider } = await this.loadProvider()
    const sandboxId = `sb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const sandboxDir = getSandboxDir(sandboxId)
    await ensureDir(sandboxDir)

    const provider = createProvider(sandboxId)

    try {
      await provider.clone(repoUrl, sandboxDir)
    } catch (err) {
      await deleteSandboxDir(sandboxId)
      throw err
    }

    const entry: RunningSandbox = {
      provider,
      projectId,
      startedAt: new Date(),
      lastAccessedAt: new Date(),
      logs: []
    }
    this.instances.set(sandboxId, entry)
    this.projectSandbox.set(projectId, sandboxId)

    return { sandboxId, status: 'cloned' }
  }

  async startSandbox(sandboxId: string, command: string): Promise<void> {
    const entry = this.instances.get(sandboxId)
    if (!entry) throw Object.assign(new Error('Sandbox not found'), { statusCode: 404 })
    const sandboxDir = getSandboxDir(sandboxId)
    await entry.provider.start(sandboxDir, command)
  }

  async stopSandbox(sandboxId: string): Promise<void> {
    const entry = this.instances.get(sandboxId)
    if (!entry) return
    await entry.provider.stop()
    this.instances.delete(sandboxId)
    this.projectSandbox.delete(entry.projectId)
    await deleteSandboxDir(sandboxId)
  }

  stopByProject(projectId: number) {
    const sandboxId = this.projectSandbox.get(projectId)
    if (sandboxId) return this.stopSandbox(sandboxId)
  }

  getStatus(sandboxId: string): RunningSandbox | undefined {
    return this.instances.get(sandboxId)
  }

  getByProject(projectId: number): RunningSandbox | undefined {
    const sandboxId = this.projectSandbox.get(projectId)
    if (!sandboxId) return undefined
    return this.instances.get(sandboxId)
  }

  getStats() {
    return { running: this.instances.size, max: this.maxConcurrent }
  }

  touch(projectId: number) {
    const sandboxId = this.projectSandbox.get(projectId)
    if (sandboxId) {
      const entry = this.instances.get(sandboxId)
      if (entry) entry.lastAccessedAt = new Date()
    }
  }

  private async reapIdle() {
    const now = Date.now()
    for (const [sandboxId, entry] of this.instances) {
      if (now - entry.lastAccessedAt.getTime() > this.idleTimeoutMs) {
        console.log(`Reaping idle sandbox ${sandboxId} for project ${entry.projectId}`)
        await this.stopSandbox(sandboxId)
      }
    }
  }

  private async loadProvider() {
    if (env.sandboxType === 'docker') {
      return await import('./dockerSandbox.js')
    }
    return await import('./processSandbox.js')
  }
}

export const sandboxPool = new SandboxPool()
```

- [ ] **Step 2: Create ProcessSandbox implementation**

```typescript
// backend/src/services/processSandbox.ts
import { exec, spawn, ChildProcess } from 'child_process'
import type { SandboxProvider } from './sandbox.js'

export function createProvider(sandboxId: string): SandboxProvider {
  return new ProcessSandbox(sandboxId)
}

class ProcessSandbox implements SandboxProvider {
  private process: ChildProcess | null = null
  private _logs: string[] = []
  private sandboxId: string

  constructor(sandboxId: string) {
    this.sandboxId = sandboxId
  }

  getSandboxId(): string {
    return this.sandboxId
  }

  async clone(repoUrl: string, targetDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`git clone ${repoUrl} .`, { cwd: targetDir, timeout: 120000 }, (err, stdout, stderr) => {
        if (err) {
          reject(new Error(`git clone failed: ${stderr || err.message}`))
          return
        }
        this._logs.push(stdout)
        resolve()
      })
    })
  }

  async start(cwd: string, command: string): Promise<void> {
    const isWin = process.platform === 'win32'
    const shell = isWin ? 'cmd' : '/bin/sh'
    const shellArgs = isWin ? ['/c', command] : ['-c', command]

    this.process = spawn(shell, shellArgs, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: !isWin
    })

    this.process.stdout?.on('data', (data: Buffer) => {
      this._logs.push(data.toString())
      if (this._logs.length > 500) this._logs = this._logs.slice(-500)
    })

    this.process.stderr?.on('data', (data: Buffer) => {
      this._logs.push(`[stderr] ${data.toString()}`)
      if (this._logs.length > 500) this._logs = this._logs.slice(-500)
    })

    this.process.on('exit', (code) => {
      this._logs.push(`Process exited with code ${code}`)
      this.process = null
    })

    // Give it a moment to fail fast if the command is invalid
    await new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (this.process?.exitCode !== null && this.process?.exitCode !== 0) {
          reject(new Error('Process failed to start'))
        } else {
          resolve()
        }
      }, 1000)
    })
  }

  async stop(): Promise<void> {
    if (!this.process) return
    try {
      if (process.platform === 'win32') {
        exec(`taskkill /pid ${this.process.pid!} /T /F`)
      } else {
        process.kill(-this.process.pid!)
      }
    } catch {
      // Process may have already exited
    }
    this.process = null
  }

  getLogs(): string[] {
    return [...this._logs]
  }

  isRunning(): boolean {
    return this.process !== null && this.process.exitCode === null
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/services/sandbox.ts backend/src/services/processSandbox.ts
git commit -m "feat: add SandboxPool and ProcessSandbox implementation"
```

---

## Task 5: DockerSandbox Placeholder

**Files:**
- Create: `backend/src/services/dockerSandbox.ts`

- [ ] **Step 1: Create DockerSandbox placeholder**

```typescript
// backend/src/services/dockerSandbox.ts
import type { SandboxProvider } from './sandbox.js'

export function createProvider(sandboxId: string): SandboxProvider {
  return new DockerSandbox(sandboxId)
}

class DockerSandbox implements SandboxProvider {
  private sandboxId: string

  constructor(sandboxId: string) {
    this.sandboxId = sandboxId
  }

  getSandboxId(): string {
    return this.sandboxId
  }

  async clone(_repoUrl: string, _targetDir: string): Promise<void> {
    throw new Error('DockerSandbox not yet implemented')
  }

  async start(_cwd: string, _command: string): Promise<void> {
    throw new Error('DockerSandbox not yet implemented')
  }

  async stop(): Promise<void> {
    throw new Error('DockerSandbox not yet implemented')
  }

  getLogs(): string[] {
    return []
  }

  isRunning(): boolean {
    return false
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/services/dockerSandbox.ts
git commit -m "feat: add DockerSandbox placeholder for production"
```

---

## Task 6: Projects Router (CRUD + Sandbox)

**Files:**
- Create: `backend/src/routes/projects.ts`
- Modify: `backend/src/app.ts`

- [ ] **Step 1: Create the projects router**

```typescript
// backend/src/routes/projects.ts
import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import { pool } from '../db/pool.js'
import { saveUploadedFiles, deleteProjectFiles } from '../services/projectStorage.js'
import { sandboxPool } from '../services/sandbox.js'
import { askQiu } from '../agents/qiu.js'

const router = Router()

// Multer config: temp files in uploads/tmp
const upload = multer({
  dest: path.resolve(import.meta.dirname, '../../uploads/tmp'),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB per file
})

// ── CRUD ──────────────────────────────────────────────

// GET /api/projects
router.get('/', async (_req: Request, res: Response) => {
  if (!pool) return res.status(500).json({ error: 'Database not configured' })

  try {
    const { rows: projects } = await pool.query(
      'SELECT id, name, description, repo_url, status, sandbox_id, created_at, updated_at FROM projects ORDER BY created_at DESC'
    )

    const { rows: images } = await pool.query(
      'SELECT id, project_id, url, sort_order FROM project_images ORDER BY project_id, sort_order'
    )
    const { rows: videos } = await pool.query(
      'SELECT id, project_id, url, sort_order FROM project_videos ORDER BY project_id, sort_order'
    )

    const imgMap = new Map<number, typeof images>()
    for (const img of images) {
      if (!imgMap.has(img.project_id)) imgMap.set(img.project_id, [])
      imgMap.get(img.project_id)!.push(img)
    }

    const vidMap = new Map<number, typeof videos>()
    for (const vid of videos) {
      if (!vidMap.has(vid.project_id)) vidMap.set(vid.project_id, [])
      vidMap.get(vid.project_id)!.push(vid)
    }

    const result = projects.map((p: any) => ({
      ...p,
      images: imgMap.get(p.id) || [],
      videos: vidMap.get(p.id) || []
    }))

    res.json({ ok: true, data: result })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/projects/:id
router.get('/:id', async (req: Request, res: Response) => {
  if (!pool) return res.status(500).json({ error: 'Database not configured' })

  try {
    const { rows } = await pool.query(
      'SELECT id, name, description, repo_url, status, sandbox_id, created_at, updated_at FROM projects WHERE id = $1',
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Project not found' })

    const project = rows[0]

    const { rows: images } = await pool.query(
      'SELECT id, url, sort_order FROM project_images WHERE project_id = $1 ORDER BY sort_order',
      [project.id]
    )
    const { rows: videos } = await pool.query(
      'SELECT id, url, sort_order FROM project_videos WHERE project_id = $1 ORDER BY sort_order',
      [project.id]
    )

    res.json({ ok: true, data: { ...project, images, videos } })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/projects — multipart: name, description, repo_url + files (images[], videos[])
router.post('/', upload.array('files', 20), async (req: Request, res: Response) => {
  if (!pool) return res.status(500).json({ error: 'Database not configured' })

  const { name, description, repo_url } = req.body
  if (!name) return res.status(400).json({ error: 'name is required' })

  try {
    const { rows } = await pool.query(
      'INSERT INTO projects (name, description, repo_url) VALUES ($1, $2, $3) RETURNING *',
      [name, description || null, repo_url || null]
    )
    const project = rows[0]

    const files = req.files as Express.Multer.File[] || []
    if (files.length > 0) {
      const { images, videos } = await saveUploadedFiles(files, project.id)

      for (let i = 0; i < images.length; i++) {
        await pool.query(
          'INSERT INTO project_images (project_id, url, sort_order) VALUES ($1, $2, $3)',
          [project.id, images[i], i]
        )
      }
      for (let i = 0; i < videos.length; i++) {
        await pool.query(
          'INSERT INTO project_videos (project_id, url, sort_order) VALUES ($1, $2, $3)',
          [project.id, videos[i], i]
        )
      }
    }

    // Re-fetch with images/videos
    const { rows: imgRows } = await pool.query(
      'SELECT id, url, sort_order FROM project_images WHERE project_id = $1 ORDER BY sort_order',
      [project.id]
    )
    const { rows: vidRows } = await pool.query(
      'SELECT id, url, sort_order FROM project_videos WHERE project_id = $1 ORDER BY sort_order',
      [project.id]
    )

    res.status(201).json({ ok: true, data: { ...project, images: imgRows, videos: vidRows } })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/projects/:id — multipart, same shape as POST
router.put('/:id', upload.array('files', 20), async (req: Request, res: Response) => {
  if (!pool) return res.status(500).json({ error: 'Database not configured' })

  try {
    const { name, description, repo_url } = req.body
    const { rows } = await pool.query(
      'UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description), repo_url = COALESCE($3, repo_url), updated_at = now() WHERE id = $4 RETURNING *',
      [name || null, description || null, repo_url || null, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Project not found' })

    const project = rows[0]

    const files = req.files as Express.Multer.File[] || []
    if (files.length > 0) {
      const { images, videos } = await saveUploadedFiles(files, project.id)

      // Get current max sort_order
      const { rows: maxImg } = await pool.query(
        'SELECT COALESCE(MAX(sort_order), -1) AS max FROM project_images WHERE project_id = $1',
        [project.id]
      )
      const { rows: maxVid } = await pool.query(
        'SELECT COALESCE(MAX(sort_order), -1) AS max FROM project_videos WHERE project_id = $1',
        [project.id]
      )

      let imgOffset = maxImg[0].max + 1
      for (const url of images) {
        await pool.query(
          'INSERT INTO project_images (project_id, url, sort_order) VALUES ($1, $2, $3)',
          [project.id, url, imgOffset++]
        )
      }
      let vidOffset = maxVid[0].max + 1
      for (const url of videos) {
        await pool.query(
          'INSERT INTO project_videos (project_id, url, sort_order) VALUES ($1, $2, $3)',
          [project.id, url, vidOffset++]
        )
      }
    }

    const { rows: imgRows } = await pool.query(
      'SELECT id, url, sort_order FROM project_images WHERE project_id = $1 ORDER BY sort_order',
      [project.id]
    )
    const { rows: vidRows } = await pool.query(
      'SELECT id, url, sort_order FROM project_videos WHERE project_id = $1 ORDER BY sort_order',
      [project.id]
    )

    res.json({ ok: true, data: { ...project, images: imgRows, videos: vidRows } })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/projects/:id
router.delete('/:id', async (req: Request, res: Response) => {
  if (!pool) return res.status(500).json({ error: 'Database not configured' })

  try {
    const id = Number(req.params.id)

    // Stop sandbox if running
    await sandboxPool.stopByProject(id)

    // Delete files
    await deleteProjectFiles(id)

    // Delete DB records (CASCADE handles images/videos)
    const { rowCount } = await pool.query('DELETE FROM projects WHERE id = $1', [id])
    if (rowCount === 0) return res.status(404).json({ error: 'Project not found' })

    res.json({ ok: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ── Sandbox ───────────────────────────────────────────

// POST /api/projects/:id/run
router.post('/:id/run', async (req: Request, res: Response) => {
  if (!pool) return res.status(500).json({ error: 'Database not configured' })

  try {
    const id = Number(req.params.id)
    const { rows } = await pool.query('SELECT * FROM projects WHERE id = $1', [id])
    if (rows.length === 0) return res.status(404).json({ error: 'Project not found' })

    const project = rows[0]
    if (!project.repo_url) return res.status(400).json({ error: 'Project has no repo_url' })

    // Update status to cloning
    await pool.query("UPDATE projects SET status = 'cloning', updated_at = now() WHERE id = $1", [id])

    let result
    try {
      result = await sandboxPool.run(id, project.repo_url)
    } catch (err: any) {
      await pool.query("UPDATE projects SET status = 'error', updated_at = now() WHERE id = $1", [id])
      const statusCode = err.statusCode || 500
      return res.status(statusCode).json({ error: err.message })
    }

    // Update sandbox_id in DB
    await pool.query(
      'UPDATE projects SET sandbox_id = $1, updated_at = now() WHERE id = $2',
      [result.sandboxId, id]
    )

    // If freshly cloned (not already running), ask Agent for start command
    if (result.status === 'cloned') {
      try {
        const sandboxDir = getSandboxDir(result.sandboxId)
        const fs = await import('fs/promises')
        const entries = await fs.readdir(sandboxDir)
        const fileList = entries.slice(0, 30).join(', ')

        const agentReply = await askQiu(
          `I just cloned a repo into a sandbox. The directory contains: ${fileList}. ` +
          `Analyze the project structure and return ONLY a single shell command that will install dependencies and start the project. ` +
          `If there are both frontend and backend, start both with &. No explanation, just the command.`,
          []
        )

        const command = agentReply.reply.trim()
        await sandboxPool.startSandbox(result.sandboxId, command)

        await pool.query(
          "UPDATE projects SET status = 'running', last_accessed_at = now(), updated_at = now() WHERE id = $1",
          [id]
        )
      } catch (err: any) {
        await pool.query("UPDATE projects SET status = 'error', updated_at = now() WHERE id = $1", [id])
        return res.status(500).json({ error: `Agent/start failed: ${err.message}` })
      }
    }

    res.json({ ok: true, data: { sandboxId: result.sandboxId, status: result.status === 'already_running' ? 'running' : 'running' } })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/projects/:id/stop
router.post('/:id/stop', async (req: Request, res: Response) => {
  if (!pool) return res.status(500).json({ error: 'Database not configured' })

  try {
    const id = Number(req.params.id)
    await sandboxPool.stopByProject(id)
    await pool.query(
      "UPDATE projects SET status = 'idle', sandbox_id = NULL, updated_at = now() WHERE id = $1",
      [id]
    )
    res.json({ ok: true })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/projects/:id/status
router.get('/:id/status', async (req: Request, res: Response) => {
  if (!pool) return res.status(500).json({ error: 'Database not configured' })

  try {
    const id = Number(req.params.id)
    sandboxPool.touch(id)

    const { rows } = await pool.query(
      'SELECT status, sandbox_id FROM projects WHERE id = $1',
      [id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Project not found' })

    const project = rows[0]
    const entry = project.sandbox_id ? sandboxPool.getStatus(project.sandbox_id) : undefined

    res.json({
      ok: true,
      data: {
        status: project.status,
        sandboxId: project.sandbox_id,
        running: entry?.provider.isRunning() ?? false,
        logs: entry?.provider.getLogs().slice(-50) ?? []
      }
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/sandbox/stats
router.get('/../sandbox/stats', async (_req: Request, res: Response) => {
  res.json({ ok: true, data: sandboxPool.getStats() })
})

export default router
```

Note: The sandbox/stats route needs to be registered separately (see Step 3) since it's not under `/api/projects/`. The path `'/../sandbox/stats'` above is a placeholder — we'll fix this in app.ts.

Actually, let's restructure: register sandbox stats as a separate route directly in the router:

Replace the second-to-last route with:

```typescript
// Note: sandbox/stats is registered in app.ts as a separate mount
```

And in app.ts (Step 3), mount the stats endpoint separately.

- [ ] **Step 2: Register router + static files in app.ts**

Read `backend/src/app.ts`. Add these imports at the top:

```typescript
import projectsRouter from './routes/projects.js'
import path from 'path'
import { fileURLToPath } from 'url'
import { sandboxPool } from './services/sandbox.js'
```

Add these lines after the existing route registrations, before `export`:

```typescript
app.use('/api/projects', projectsRouter)

// Sandbox pool stats (separate from projects)
app.get('/api/sandbox/stats', (_req, res) => {
  res.json({ ok: true, data: sandboxPool.getStats() })
})

// Serve uploaded files
const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')))

// Start sandbox pool idle reaper
sandboxPool.start()
```

Also add multer's tmp directory creation. Add to the startup in `server.ts` or at the top of the sandbox init:

```typescript
import fs from 'fs'
const tmpDir = path.resolve(__dirname, '../uploads/tmp')
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
```

- [ ] **Step 3: Build and verify no type errors**

Run: `cd backend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add backend/src/routes/projects.ts backend/src/app.ts
git commit -m "feat: add projects CRUD and sandbox API routes"
```

---

## Task 7: Frontend API Client Updates

**Files:**
- Modify: `frontend/src/api/client.js`

- [ ] **Step 1: Add project API functions**

Read `frontend/src/api/client.js`. Append these functions after the existing exports:

```javascript
export async function fetchProjects() {
  return fetchApi('/projects')
}

export async function fetchProject(id) {
  return fetchApi(`/projects/${id}`)
}

export async function runSandbox(projectId) {
  return fetchApi(`/projects/${projectId}/run`, { method: 'POST' })
}

export async function stopSandbox(projectId) {
  return fetchApi(`/projects/${projectId}/stop`, { method: 'POST' })
}

export async function fetchSandboxStatus(projectId) {
  return fetchApi(`/projects/${projectId}/status`)
}

export async function fetchSandboxStats() {
  return fetchApi('/sandbox/stats')
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/api/client.js
git commit -m "feat: add project and sandbox API client functions"
```

---

## Task 8: Frontend Projects Page — Wire to API

**Files:**
- Modify: `frontend/src/pages/Projects.jsx`

- [ ] **Step 1: Replace mock data with API calls**

The current `Projects.jsx` reads from `t.pages.projects.items` and a hardcoded `MOCK` object. Replace with:

1. Add `useEffect` to fetch projects from API on mount
2. Replace `MOCK` data with API response data
3. Keep the existing film-reel UI structure intact

At the top of `Projects.jsx`, add the import:

```javascript
import { fetchProjects, runSandbox, stopSandbox, fetchSandboxStatus } from '../api/client'
```

Add state + fetch inside the `Projects` component, before the existing state declarations:

```javascript
const [projects, setProjects] = useState([])
const [sandboxStates, setSandboxStates] = useState({}) // { [projectId]: { status, logs, running } }
```

Add a useEffect after the state declarations:

```javascript
useEffect(() => {
  fetchProjects()
    .then(res => setProjects(res.data || []))
    .catch(() => {})
}, [])
```

Replace the `MOCK` object usage. Where the component currently maps over `t.pages.projects.items`, change it to map over `projects` from API. The existing UI expects `label`, `title`, `body` — map the API response to this shape:

```javascript
const items = projects.length > 0
  ? projects.map(p => ({
      label: p.name?.toUpperCase().slice(0, 8) || 'PROJECT',
      title: p.name,
      body: p.description || '',
      id: p.id,
      repoUrl: p.repo_url,
      images: p.images || [],
      videos: p.videos || [],
      status: p.status
    }))
  : (t.pages.projects.items || []).map(item => ({
      ...item,
      id: null,
      status: 'idle'
    }))
```

For the film strip frames that reference `MOCK[label]`, replace with data from the mapped item. The Tags, Note, Status frames should use `item.images.length`, `item.repoUrl`, `item.status` etc.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Projects.jsx
git commit -m "feat: wire Projects page to backend API"
```

---

## Task 9: Integration Test — Full Flow

**Files:**
- No new files — manual testing

- [ ] **Step 1: Start backend**

Run: `cd backend && pnpm dev`
Expected: Server listening on port 4000

- [ ] **Step 2: Run migration**

Run: `cd backend && npx tsx scripts/init-projects.ts`
Expected: "Projects tables created successfully"

- [ ] **Step 3: Create a test project via curl**

Run:
```bash
curl -X POST http://localhost:4000/api/projects \
  -F "name=Test Project" \
  -F "description=A test project" \
  -F "repo_url=https://github.com/example/repo"
```
Expected: `{ ok: true, data: { id: 1, name: "Test Project", ... } }`

- [ ] **Step 4: Verify GET /api/projects**

Run: `curl http://localhost:4000/api/projects`
Expected: `{ ok: true, data: [{ id: 1, name: "Test Project", images: [], videos: [] }] }`

- [ ] **Step 5: Test delete**

Run: `curl -X DELETE http://localhost:4000/api/projects/1`
Expected: `{ ok: true }`

- [ ] **Step 6: Start frontend and verify Projects page**

Run: `cd frontend && pnpm dev`
Open http://localhost:3000/#/projects — should render the page (empty if no projects in DB, or the API data)

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: complete projects API + sandbox implementation"
```
