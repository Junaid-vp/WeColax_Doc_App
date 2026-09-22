'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';



export async function saveAssetAction(title: string, url: string, fileType: string, sizeBytes: number) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    await prisma.brandAsset.create({
      data: {
        title,
        cloudStorageUrl: url,
        fileType,
        sizeBytes,
        uploadedBy: session.user.role
      }
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPLOADED_BRAND_ASSET',
        userId: session.userId,
        details: `Uploaded asset: ${title}`,
      }
    });

    revalidatePath('/assets');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to save asset' };
  }
}

export async function deleteAssetAction(id: string) {
  const session = await getSession();
  if (!session) return { success: false, error: 'Unauthorized' };

  try {
    const asset = await prisma.brandAsset.findUnique({ where: { id } });
    if (!asset) return { success: false, error: 'Asset not found' };

    await prisma.brandAsset.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        action: 'DELETED_BRAND_ASSET',
        userId: session.userId,
        details: `Deleted asset: ${asset.title}`,
      }
    });

    revalidatePath('/assets');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete asset' };
  }
}
