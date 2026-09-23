'use server';

import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function updatePasswordAction(prevState: any, formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!currentPassword || !newPassword) {
    return { error: 'Both fields are required' };
  }

  if (newPassword.length < 8) {
    return { error: 'New password must be at least 8 characters' };
  }

  const session = await getSession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  });

  if (!user) {
    return { error: 'User not found' };
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    return { error: 'Current password is incorrect' };
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash }
  });

  await prisma.auditLog.create({
    data: {
      action: 'CHANGED_PASSWORD',
      userId: user.id,
      details: 'User updated their password'
    }
  });

  return { success: true };
}
