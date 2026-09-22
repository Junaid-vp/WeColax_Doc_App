'use server';

import { prisma } from '@/lib/prisma';
import { encryptData } from '@/lib/encryption';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';



export async function addDocAction(title: string, rawContent: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const { encryptedContent, iv } = encryptData(rawContent);

    await prisma.projectDoc.create({
      data: {
        title,
        encryptedContent,
        iv,
        updatedBy: session.user.role
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'ADDED_SECURE_DOC',
        userId: session.userId,
        details: `Added new encrypted document: ${title}`,
      }
    });

    revalidatePath('/docs');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to encrypt and save' };
  }
}

export async function addBulkDocsAction(docs: { title: string; content: string }[]) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  if (!docs || docs.length === 0) return { success: false, error: 'No documents provided' };

  try {
    const encryptedDocs = docs.map(doc => {
      const { encryptedContent, iv } = encryptData(doc.content);
      return {
        title: doc.title,
        encryptedContent,
        iv,
        updatedBy: session.user.role
      };
    });

    // Use Prisma transaction to ensure all inserts happen together (since createMany isn't strictly available for encrypted things without a single step, though createMany is fine here)
    await prisma.projectDoc.createMany({
      data: encryptedDocs,
      skipDuplicates: true // Just in case titles clash
    });

    await prisma.auditLog.create({
      data: {
        action: 'ADDED_SECURE_DOC',
        userId: session.userId,
        details: `Bulk added ${docs.length} encrypted documents`,
      }
    });

    revalidatePath('/docs');
    return { success: true, count: docs.length };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to bulk encrypt and save' };
  }
}

export async function deleteDocAction(id: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const doc = await prisma.projectDoc.findUnique({ where: { id } });
    if (!doc) return { success: false, error: 'Document not found' };

    await prisma.projectDoc.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETED_SECURE_DOC',
        userId: session.userId,
        details: `Deleted encrypted document: ${doc.title}`,
      }
    });

    revalidatePath('/docs');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete document' };
  }
}

export async function updateDocAction(id: string, newContent: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const doc = await prisma.projectDoc.findUnique({ where: { id } });
    if (!doc) return { success: false, error: 'Document not found' };

    const { encryptedContent, iv } = encryptData(newContent);

    await prisma.projectDoc.update({
      where: { id },
      data: {
        encryptedContent,
        iv,
        updatedBy: session.user.role
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATED_SECURE_DOC',
        userId: session.userId,
        details: `Updated encrypted document: ${doc.title}`,
      }
    });

    revalidatePath('/docs');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update document' };
  }
}
