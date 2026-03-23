'use server';

import { createPhotoSession } from '@/db/queries';
import { revalidatePath } from 'next/cache';

export async function createPhotoSessionAction(skuId: number, formData: FormData) {
  const label = (formData.get('label') as string).trim();
  if (!label) return;

  await createPhotoSession(skuId, label);
  revalidatePath(`/sku/${skuId}`);
}
