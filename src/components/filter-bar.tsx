'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function FilterBar({ filters }: { filters: { label: string; value: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('filter') || '';

  function setFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('filter', value);
    } else {
      params.delete('filter');
    }
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={() => setFilter('')}
        className={`px-3 py-1 text-xs rounded-full ${
          !current ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Wszystkie
      </button>
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => setFilter(f.value)}
          className={`px-3 py-1 text-xs rounded-full ${
            current === f.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
