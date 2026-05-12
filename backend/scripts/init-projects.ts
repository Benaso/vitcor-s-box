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
