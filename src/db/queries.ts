import { neon } from '@neondatabase/serverless';

function getDb() {
  return neon(process.env.DATABASE_URL!);
}

// ─── SKU ────────────────────────────────────────────

export async function getSkus(search: string, filterOutdated: boolean) {
  const sql = getDb();
  const pattern = `%${search}%`;

  if (filterOutdated) {
    const rows = await sql`
      SELECT s.id, s.code, s.name, s.created_at,
        COUNT(scs.id)::int AS total_channels,
        COUNT(CASE WHEN scs.photo_session_id = ps_latest.id THEN 1 END)::int AS up_to_date
      FROM sku s
      LEFT JOIN sku_channel_status scs ON scs.sku_id = s.id
      LEFT JOIN LATERAL (
        SELECT id FROM photo_session WHERE sku_id = s.id ORDER BY id DESC LIMIT 1
      ) ps_latest ON TRUE
      WHERE (s.code ILIKE ${pattern} OR s.name ILIKE ${pattern})
      GROUP BY s.id, s.code, s.name, s.created_at
      HAVING COUNT(scs.id) > COUNT(CASE WHEN scs.photo_session_id = ps_latest.id THEN 1 END)
      ORDER BY s.code
    `;
    return rows;
  }

  const rows = await sql`
    SELECT s.id, s.code, s.name, s.created_at,
      COUNT(scs.id)::int AS total_channels,
      COUNT(CASE WHEN scs.photo_session_id = ps_latest.id THEN 1 END)::int AS up_to_date
    FROM sku s
    LEFT JOIN sku_channel_status scs ON scs.sku_id = s.id
    LEFT JOIN LATERAL (
      SELECT id FROM photo_session WHERE sku_id = s.id ORDER BY id DESC LIMIT 1
    ) ps_latest ON TRUE
    WHERE s.code ILIKE ${pattern} OR s.name ILIKE ${pattern}
    GROUP BY s.id, s.code, s.name, s.created_at
    ORDER BY s.code
  `;
  return rows;
}

export async function getSkuById(id: number) {
  const sql = getDb();
  const rows = await sql`SELECT * FROM sku WHERE id = ${id}`;
  return rows[0] || null;
}

export async function createSku(code: string, name: string) {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO sku (code, name) VALUES (${code}, ${name}) RETURNING id
  `;
  const skuId = rows[0].id;

  // Create status rows for all existing channels
  await sql`
    INSERT INTO sku_channel_status (sku_id, channel_id)
    SELECT ${skuId}, id FROM channel
  `;

  return skuId;
}

export async function deleteSku(id: number) {
  const sql = getDb();
  await sql`DELETE FROM sku WHERE id = ${id}`;
}

// ─── CHANNEL ────────────────────────────────────────

export async function getChannels() {
  const sql = getDb();
  return sql`SELECT * FROM channel ORDER BY type, name`;
}

export async function createChannel(name: string, type: 'store' | 'marketplace') {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO channel (name, type) VALUES (${name}, ${type}) RETURNING id
  `;
  const channelId = rows[0].id;

  // Create status rows for all existing SKUs
  await sql`
    INSERT INTO sku_channel_status (sku_id, channel_id)
    SELECT id, ${channelId} FROM sku
  `;

  return channelId;
}

export async function deleteChannel(id: number) {
  const sql = getDb();
  await sql`DELETE FROM channel WHERE id = ${id}`;
}

// ─── PHOTO SESSION ──────────────────────────────────

export async function getPhotoSessionsForSku(skuId: number) {
  const sql = getDb();
  return sql`
    SELECT * FROM photo_session WHERE sku_id = ${skuId} ORDER BY id DESC
  `;
}

export async function createPhotoSession(skuId: number, label: string) {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO photo_session (sku_id, label) VALUES (${skuId}, ${label}) RETURNING id
  `;
  return rows[0].id;
}

// ─── SKU CHANNEL STATUS ─────────────────────────────

export async function getChannelStatusesForSku(skuId: number, filter?: 'outdated' | 'updated') {
  const sql = getDb();

  const rows = await sql`
    SELECT scs.id, scs.sku_id, scs.channel_id, scs.photo_session_id,
      scs.is_updated, scs.note, scs.updated_at,
      c.name AS channel_name, c.type AS channel_type,
      ps.label AS session_label,
      ps_latest.id AS latest_session_id,
      ps_latest.label AS latest_session_label,
      CASE
        WHEN ps_latest.id IS NULL THEN FALSE
        WHEN scs.photo_session_id IS NULL THEN TRUE
        WHEN scs.photo_session_id != ps_latest.id THEN TRUE
        ELSE FALSE
      END AS is_outdated
    FROM sku_channel_status scs
    JOIN channel c ON c.id = scs.channel_id
    LEFT JOIN photo_session ps ON ps.id = scs.photo_session_id
    LEFT JOIN LATERAL (
      SELECT id, label FROM photo_session WHERE sku_id = ${skuId} ORDER BY id DESC LIMIT 1
    ) ps_latest ON TRUE
    WHERE scs.sku_id = ${skuId}
    ORDER BY c.type, c.name
  `;

  if (filter === 'outdated') return rows.filter(r => r.is_outdated);
  if (filter === 'updated') return rows.filter(r => !r.is_outdated);
  return rows;
}

export async function updateStatusSession(statusId: number, photoSessionId: number | null) {
  const sql = getDb();
  await sql`
    UPDATE sku_channel_status
    SET photo_session_id = ${photoSessionId}, updated_at = NOW()
    WHERE id = ${statusId}
  `;
}

export async function updateStatusIsUpdated(statusId: number, value: boolean) {
  const sql = getDb();
  await sql`
    UPDATE sku_channel_status
    SET is_updated = ${value}, updated_at = NOW()
    WHERE id = ${statusId}
  `;
}

export async function updateStatusNote(statusId: number, note: string) {
  const sql = getDb();
  await sql`
    UPDATE sku_channel_status
    SET note = ${note}, updated_at = NOW()
    WHERE id = ${statusId}
  `;
}
