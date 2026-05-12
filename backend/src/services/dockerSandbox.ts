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
