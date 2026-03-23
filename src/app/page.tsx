import Link from 'next/link';
import { Suspense } from 'react';
import { getSkus } from '@/db/queries';
import { SkuSearch } from '@/components/sku-search';
import { FilterBar } from '@/components/filter-bar';
import { createSkuAction } from './actions/sku-actions';

export const dynamic = 'force-dynamic';

export default async function Home({
  searchParams,
}: {
  searchParams: { q?: string; filter?: string };
}) {
  const search = searchParams.q || '';
  const filterOutdated = searchParams.filter === 'outdated';
  const skus = await getSkus(search, filterOutdated);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">SKU</h1>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <Suspense>
          <SkuSearch />
        </Suspense>
        <Suspense>
          <FilterBar filters={[{ label: 'Nieaktualne', value: 'outdated' }]} />
        </Suspense>
      </div>

      {/* New SKU form */}
      <form action={createSkuAction} className="flex gap-2 mb-6">
        <input
          name="code"
          placeholder="Kod SKU"
          required
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
        />
        <input
          name="name"
          placeholder="Nazwa"
          required
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg"
        />
        <button
          type="submit"
          className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800"
        >
          + Nowe SKU
        </button>
      </form>

      {/* SKU table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">Kod</th>
              <th className="px-4 py-3">Nazwa</th>
              <th className="px-4 py-3">Status kanałów</th>
              <th className="px-4 py-3">Dodano</th>
            </tr>
          </thead>
          <tbody>
            {skus.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  Brak wyników
                </td>
              </tr>
            )}
            {skus.map((sku) => (
              <tr key={sku.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/sku/${sku.id}`} className="text-blue-600 hover:underline font-medium">
                    {sku.code}
                  </Link>
                </td>
                <td className="px-4 py-3">{sku.name}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${
                    Number(sku.up_to_date) === Number(sku.total_channels) && Number(sku.total_channels) > 0
                      ? 'text-green-600'
                      : 'text-amber-600'
                  }`}>
                    {sku.up_to_date}/{sku.total_channels} aktualnych
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(sku.created_at).toLocaleDateString('pl-PL')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
