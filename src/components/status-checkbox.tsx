'use client';

import { useTransition } from 'react';
import { updateIsUpdatedAction } from '@/app/actions/status-actions';

export function StatusCheckbox({ statusId, skuId, checked }: { statusId: number; skuId: number; checked: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      defaultChecked={checked}
      disabled={isPending}
      className={`h-4 w-4 rounded border-gray-300 text-blue-600 ${isPending ? 'opacity-50' : ''}`}
      onChange={(e) => {
        startTransition(() => updateIsUpdatedAction(statusId, skuId, e.target.checked));
      }}
    />
  );
}
