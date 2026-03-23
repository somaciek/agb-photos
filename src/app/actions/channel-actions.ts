'use server';

import { createChannel, deleteChannel } from '@/db/queries';
import { revalidatePath } from 'next/cache';

export async function createChannelAction(formData: FormData) {
  const name = (formData.get('name') as string).trim();
  const type = formData.get('type') as 'store' | 'marketplace';
  if (!name || !type) return;

  await createChannel(name, type);
  revalidatePath('/channels');
}

export async function deleteChannelAction(id: number) {
  await deleteChannel(id);
  revalidatePath('/channels');
}
