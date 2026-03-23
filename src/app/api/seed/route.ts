import { createTables } from '@/db/schema';
import { neon } from '@neondatabase/serverless';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await createTables();

    const sql = neon(process.env.DATABASE_URL!);

    // Default channels
    const channels = [
      { name: 'Shopify US', type: 'store' },
      { name: 'Shopify EU', type: 'store' },
      { name: 'Website', type: 'store' },
      { name: 'Amazon US', type: 'marketplace' },
      { name: 'Amazon DE', type: 'marketplace' },
      { name: 'Amazon UK', type: 'marketplace' },
      { name: 'Etsy', type: 'marketplace' },
      { name: 'eBay', type: 'marketplace' },
      { name: 'Allegro', type: 'marketplace' },
    ];

    for (const ch of channels) {
      await sql`INSERT INTO channel (name, type) VALUES (${ch.name}, ${ch.type}) ON CONFLICT (name) DO NOTHING`;
    }

    // Sample SKUs
    const skus = [
      { code: 'AGB-RING-001', name: 'Złota obrączka 6mm' },
      { code: 'AGB-NECK-012', name: 'Srebrny łańcuszek 45cm' },
      { code: 'AGB-BRAC-007', name: 'Bransoletka skórzana' },
    ];

    for (const s of skus) {
      const rows = await sql`INSERT INTO sku (code, name) VALUES (${s.code}, ${s.name}) ON CONFLICT (code) DO NOTHING RETURNING id`;
      if (rows.length > 0) {
        const skuId = rows[0].id;
        // Create status rows for all channels
        await sql`
          INSERT INTO sku_channel_status (sku_id, channel_id)
          SELECT ${skuId}, id FROM channel
          ON CONFLICT (sku_id, channel_id) DO NOTHING
        `;
      }
    }

    // Sample photo sessions
    const allSkus = await sql`SELECT id, code FROM sku`;
    for (const s of allSkus) {
      const existing = await sql`SELECT id FROM photo_session WHERE sku_id = ${s.id} LIMIT 1`;
      if (existing.length === 0) {
        await sql`INSERT INTO photo_session (sku_id, label) VALUES (${s.id}, ${'Sesja startowa 2025'})`;
        await sql`INSERT INTO photo_session (sku_id, label) VALUES (${s.id}, ${'Wiosna 2026'})`;
      }
    }

    return NextResponse.json({ success: true, message: 'Seed completed' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
