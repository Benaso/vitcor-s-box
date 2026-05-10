import pg from 'pg'
import { env } from '../config/env.js'

const { Pool } = pg

export const pool = env.databaseUrl
  ? new Pool({
      connectionString: env.databaseUrl
    })
  : null

export async function checkDatabase() {
  if (!pool) {
    return { configured: false, ok: false }
  }

  const result = await pool.query<{ ok: number }>('select 1 as ok')
  return { configured: true, ok: result.rows[0]?.ok === 1 }
}
