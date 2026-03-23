'use server';

import { createSku, deleteSku } from '@/db/queries';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createSkuAction(formData: FormData) {
  const code = (formData.get('code') as string).trim();
  const name = (formData.get('name') as string).trim();
  if (!code || !name) return;

  await createSku(code, name);
  revalidatePath('/');
}

export async function deleteSkuAction(id: number) {
  await deleteSku(id);
  revalidatePath('/');
  redirect('/');
}
