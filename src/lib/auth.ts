import 'server-only';
import { cookies, headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function createSession(userId: string) {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || 'Unknown Device';
  const ip = headersList.get('x-forwarded-for') || 'Unknown IP';
  
  const isMobile = /mobile/i.test(userAgent);
  const deviceInfo = isMobile ? 'Mobile' : 'Desktop';

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
      deviceInfo,
      ipAddress: ip,
    }
  });

  const cookieStore = await cookies();
  cookieStore.set('wecolax_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires,
    path: '/'
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('wecolax_session')?.value;
  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true }
  });

  if (!session || session.expires < new Date()) {
    return null;
  }

  // Fire-and-forget: don't block navigation waiting for this write
  prisma.session.update({
    where: { id: session.id },
    data: { lastActiveAt: new Date() }
  }).catch(() => {});

  return session;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('wecolax_session')?.value;
  if (sessionToken) {
    await prisma.session.delete({ where: { sessionToken } }).catch(() => {});
  }
  cookieStore.delete('wecolax_session');
}
