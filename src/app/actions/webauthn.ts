'use server';

import { cookies, headers } from 'next/headers';
import { generateRegistrationOptions, verifyRegistrationResponse } from '@simplewebauthn/server';
import type { RegistrationResponseJSON } from '@simplewebauthn/types';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';


const rpName = 'WeColax Vault';
// rpID and origin are now dynamically extracted from headers in each action

export async function getRegistrationOptionsAction() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const rpID = host.split(':')[0];
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { authenticators: true }
  });
  
  if (!user) throw new Error('User not found');

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: user.id, // @simplewebauthn v10+ accepts string natively
    userName: user.email,
    attestationType: 'none',
    excludeCredentials: user.authenticators.map(auth => ({
      id: Buffer.from(auth.credentialID, 'base64url'),
      type: 'public-key',
    })),
    authenticatorSelection: {
      residentKey: 'required',
      userVerification: 'preferred',
    },
  });

  const cookieStore = await cookies();
  cookieStore.set('webauthn_challenge', options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 5, // 5 minutes
    path: '/'
  });

  return options;
}

export async function verifyRegistrationAction(body: RegistrationResponseJSON) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const rpID = host.split(':')[0];
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const origin = `${protocol}://${host}`;

  const cookieStore = await cookies();
  const expectedChallenge = cookieStore.get('webauthn_challenge')?.value;

  if (!expectedChallenge) {
    throw new Error('Challenge expired or not found');
  }

  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });

  const { verified, registrationInfo } = verification;

  if (verified && registrationInfo) {
    const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } = registrationInfo;

    // Save the authenticator to the DB
    await prisma.authenticator.create({
      data: {
        credentialID: Buffer.from(credentialID).toString('base64url'),
        credentialPublicKey: Buffer.from(credentialPublicKey),
        counter: BigInt(counter),
        credentialDeviceType,
        credentialBackedUp,
        userId: session.userId,
      },
    });

    // Clear challenge
    cookieStore.delete('webauthn_challenge');

    return { success: true };
  }

  return { success: false, error: 'Verification failed' };
}

import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import type { AuthenticationResponseJSON } from '@simplewebauthn/types';
import { createSession } from '@/lib/auth';

export async function getAuthenticationOptionsAction(email: string) {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const rpID = host.split(':')[0];

  const user = await prisma.user.findUnique({
    where: { email },
    include: { authenticators: true }
  });
  
  if (!user) throw new Error('User not found');

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: user.authenticators.map(auth => ({
      id: Buffer.from(auth.credentialID, 'base64url'),
      type: 'public-key',
    })),
    userVerification: 'preferred',
  });

  const cookieStore = await cookies();
  cookieStore.set('webauthn_auth_challenge', options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 5, // 5 minutes
    path: '/'
  });

  return options;
}

export async function verifyAuthenticationAction(body: AuthenticationResponseJSON, email: string) {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const rpID = host.split(':')[0];
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const origin = `${protocol}://${host}`;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { authenticators: true }
  });
  
  if (!user) return { success: false, error: 'User not found' };

  const cookieStore = await cookies();
  const expectedChallenge = cookieStore.get('webauthn_auth_challenge')?.value;

  if (!expectedChallenge) {
    return { success: false, error: 'Challenge expired or not found' };
  }

  const authenticator = user.authenticators.find(
    auth => auth.credentialID === body.id
  );

  if (!authenticator) {
    return { success: false, error: 'Authenticator not found for this user' };
  }

  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator: {
      credentialID: Uint8Array.from(Buffer.from(authenticator.credentialID, 'base64url')),
      credentialPublicKey: Uint8Array.from(authenticator.credentialPublicKey),
      counter: Number(authenticator.counter), // Note: counter is BigInt in DB but library wants number
      transports: authenticator.transports ? (authenticator.transports.split(',') as any) : undefined,
    },
  });

  const { verified, authenticationInfo } = verification;

  if (verified && authenticationInfo) {
    // Update counter
    await prisma.authenticator.update({
      where: { credentialID: authenticator.credentialID },
      data: { counter: BigInt(authenticationInfo.newCounter) }
    });
    
    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Login successful, create session!
    await createSession(user.id);
    cookieStore.delete('webauthn_auth_challenge');

    return { success: true };
  }

  return { success: false, error: 'Authentication verification failed' };
}
