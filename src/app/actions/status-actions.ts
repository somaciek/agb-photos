'use server';

import { updateStatusSession, updateStatusIsUpdated, updateStatusNote } from '@/db/queries';
import { revalidatePath } from 'next/cache';

export async function updateSessionAction(statusId: number, skuId: number, photoSessionId: number | null) {
  await updateStatusSession(statusId, photoSessionId);
  revalidatePath(`/sku/${skuId}`);
}

export async function updateIsUpdatedAction(statusId: number, skuId: number, value: boolean) {
  await updateStatusIsUpdated(statusId, value);
  revalidatePath(`/sku/${skuId}`);
}

export async function updateNoteAction(statusId: number, skuId: number, note: string) {
  await updateStatusNote(statusId, note);
  revalidatePath(`/sku/${skuId}`);
}
