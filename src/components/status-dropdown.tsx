'use client';

import { useTransition } from 'react';
import { updateSessionAction } from '@/app/actions/status-actions';

interface Props {
  statusId: number;
  skuId: number;
  currentSessionId: number | null;
  sessions: { id: number; label: string }[];
}

export function StatusDropdown({ statusId, skuId, currentSessionId, sessions }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={currentSessionId ?? ''}
      disabled={isPending}
      className={`text-sm border border-gray-300 rounded px-2 py-1 ${isPending ? 'opacity-50' : ''}`}
      onChange={(e) => {
        const val = e.target.value ? Number(e.target.value) : null;
        startTransition(() => updateSessionAction(statusId, skuId, val));
      }}
    >
      <option value="">-- brak --</option>
      {sessions.map((s) => (
        <option key={s.id} value={s.id}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
