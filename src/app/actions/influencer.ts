'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

const prisma = new PrismaClient();

export async function addInfluencerAction(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const details = formData.get('details') as string;
  const videoLinksRaw = formData.get('videoLinks') as string;

  const videoLinks = videoLinksRaw
    .split(',')
    .map((link) => link.trim())
    .filter((link) => link.length > 0);

  await prisma.influencer.create({
    data: {
      name,
      details,
      videoLinks,
    },
  });

  // Log action for security dashboard
  await prisma.auditLog.create({
    data: {
      action: `Added new influencer campaign: ${name}`,
      userId: session.userId,
    }
  });

  revalidatePath('/influencers');
  return { success: true };
}
