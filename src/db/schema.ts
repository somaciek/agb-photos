import { neon } from '@neondatabase/serverless';

export async function createTables() {
  const sql = neon(process.env.DATABASE_URL!);

  await sql`
    CREATE TABLE IF NOT EXISTS sku (
      id         SERIAL PRIMARY KEY,
      code       TEXT NOT NULL UNIQUE,
      name       TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS channel (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL UNIQUE,
      type       TEXT NOT NULL CHECK(type IN ('store', 'marketplace')),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS photo_session (
      id         SERIAL PRIMARY KEY,
      sku_id     INTEGER NOT NULL REFERENCES sku(id) ON DELETE CASCADE,
      label      TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sku_channel_status (
      id               SERIAL PRIMARY KEY,
      sku_id           INTEGER NOT NULL REFERENCES sku(id) ON DELETE CASCADE,
      channel_id       INTEGER NOT NULL REFERENCES channel(id) ON DELETE CASCADE,
      photo_session_id INTEGER REFERENCES photo_session(id) ON DELETE SET NULL,
      is_updated       BOOLEAN NOT NULL DEFAULT FALSE,
      note             TEXT NOT NULL DEFAULT '',
      updated_at       TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE(sku_id, channel_id)
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_photo_session_sku ON photo_session(sku_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_scs_sku ON sku_channel_status(sku_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_scs_channel ON sku_channel_status(channel_id)`;
}
