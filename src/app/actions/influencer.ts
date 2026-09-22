'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';



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

export async function deleteInfluencerAction(id: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const influencer = await prisma.influencer.findUnique({ where: { id } });
    if (!influencer) return { success: false, error: 'Influencer not found' };

    await prisma.influencer.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETED_INFLUENCER',
        userId: session.userId,
        details: `Deleted influencer: ${influencer.name}`,
      }
    });

    revalidatePath('/influencers');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete influencer' };
  }
}
