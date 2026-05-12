import dotenv from 'dotenv'

dotenv.config()

const toNumber = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: toNumber(process.env.PORT, 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL,
  minimaxApiKey: process.env.MINIMAX_API_KEY ?? process.env.ANTHROPIC_AUTH_TOKEN ?? process.env.ANTHROPIC_API_KEY,
  minimaxBaseUrl: process.env.MINIMAX_BASE_URL ?? process.env.ANTHROPIC_BASE_URL ?? 'https://api.minimaxi.com/anthropic',
  minimaxModel: process.env.MINIMAX_MODEL ?? 'MiniMax-M2.7',
  sandboxType: process.env.SANDBOX_TYPE ?? 'process',     // 'process' | 'docker'
  maxSandboxed: toNumber(process.env.MAX_SANDBOXES, 15),
  sandboxIdleTimeout: toNumber(process.env.SANDBOX_IDLE_TIMEOUT, 1800000), // ms, default 30 min
}
