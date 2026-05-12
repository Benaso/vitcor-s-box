// backend/src/services/processSandbox.ts
import { exec, spawn, type ChildProcess } from 'child_process'
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
