import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getSkuById, getPhotoSessionsForSku, getChannelStatusesForSku } from '@/db/queries';
import { ChannelStatusTable } from '@/components/channel-status-table';
import { FilterBar } from '@/components/filter-bar';
import { createPhotoSessionAction } from '@/app/actions/session-actions';
import { deleteSkuAction } from '@/app/actions/sku-actions';

export const dynamic = 'force-dynamic';

export default async function SkuDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { filter?: string };
}) {
  const skuId = Number(params.id);
  const sku = await getSkuById(skuId);
  if (!sku) notFound();

  const sessions = await getPhotoSessionsForSku(skuId);
  const filter = (searchParams.filter as 'outdated' | 'updated' | undefined) || undefined;
  const statuses = await getChannelStatusesForSku(skuId, filter);

  const createSessionWithSkuId = createPhotoSessionAction.bind(null, skuId);

  return (
    <div>
      <div className="mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          ← Powrót do listy
        </Link>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{sku.code}</h1>
          <p className="text-gray-500">{sku.name}</p>
        </div>
        <form action={async () => {
          'use server';
          await deleteSkuAction(skuId);
        }}>
          <button
            type="submit"
            className="text-xs text-red-500 hover:text-red-700 px-3 py-1 border border-red-200 rounded hover:bg-red-50"
          >
            Usuń SKU
          </button>
        </form>
      </div>

      {/* Photo sessions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Sesje zdjęciowe</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          {sessions.length === 0 && (
            <span className="text-sm text-gray-400">Brak sesji</span>
          )}
          {sessions.map((s) => (
            <span key={s.id} className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              {s.label}
            </span>
          ))}
        </div>
        <form action={createSessionWithSkuId} className="flex gap-2">
          <input
            name="label"
            placeholder="Nazwa nowej sesji..."
            required
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg"
          />
          <button
            type="submit"
            className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            + Nowa sesja
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <Suspense>
          <FilterBar filters={[
            { label: 'Nieaktualne', value: 'outdated' },
            { label: 'Aktualne', value: 'updated' },
          ]} />
        </Suspense>
      </div>

      {/* Channel status table */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Status kanałów</h2>
        <ChannelStatusTable
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rows={statuses as any}
          sessions={sessions.map((s) => ({ id: s.id, label: s.label }))}
          skuId={skuId}
        />
      </div>
    </div>
  );
}
