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
