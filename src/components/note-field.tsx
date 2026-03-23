'use client';

import { useState, useTransition } from 'react';
import { updateNoteAction } from '@/app/actions/status-actions';

export function NoteField({ statusId, skuId, initialNote }: { statusId: number; skuId: number; initialNote: string }) {
  const [value, setValue] = useState(initialNote);
  const [isPending, startTransition] = useTransition();

  function save() {
    if (value !== initialNote) {
      startTransition(() => updateNoteAction(statusId, skuId, value));
    }
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
      disabled={isPending}
      placeholder="..."
      className={`text-sm border border-gray-300 rounded px-2 py-1 w-full ${isPending ? 'opacity-50' : ''}`}
    />
  );
}
