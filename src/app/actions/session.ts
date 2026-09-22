'use server';

import { PrismaClient } from '@prisma/client';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function revokeSessionAction(sessionId: string) {
  const currentSession = await getSession();
  if (!currentSession) return { success: false, error: 'Unauthorized' };

  try {
    // Ensure the admin is not deleting their own current session via this button
    // (though they could if they really wanted to, but we want to prevent accidents)
    if (currentSession.id === sessionId) {
      return { success: false, error: 'Cannot revoke your active session from here.' };
    }

    await prisma.session.delete({
      where: { id: sessionId }
    });

    // Log the audit action
    await prisma.auditLog.create({
      data: {
        action: 'FORCE_LOGOUT_SESSION',
        userId: currentSession.userId,
        details: `Revoked session ${sessionId}`,
      }
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to revoke session' };
  }
}
