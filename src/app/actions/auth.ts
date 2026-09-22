'use server';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { createSession } from '@/lib/auth';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export async function verifyPasswordAction(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: 'Invalid credentials' };

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return { success: false, error: 'Invalid credentials' };

    // Generate 6-digit OTP (fixed in development)
    const otp = process.env.NODE_ENV === 'development' 
      ? '123456' 
      : Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to DB
    await prisma.verificationToken.create({
      data: {
        email,
        token: otp,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      }
    });

    // Send email via Resend using custom domain
    await resend.emails.send({
      from: 'WeColax Security <security@wecolax.com>', 
      to: 'wecolax.com@gmail.com', // Central inbox for all executive OTPs
      subject: `Your WeColax Portal OTP Code (for ${email})`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0a0a0a; color: #fff; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; text-align: center;">
          <h2 style="color: #a855f7;">WeColax Secure Login</h2>
          <p style="font-size: 16px; color: #d1d5db;">Secure OTP for <strong>${email}</strong>:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 20px; background-color: #1f2937; border-radius: 8px; margin: 20px 0; color: #fff;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #9ca3af;">This code expires in 10 minutes. Do not share it with anyone.</p>
        </div>
      `
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'An error occurred during authentication' };
  }
}

export async function verifyOtpAction(email: string, otp: string) {
  try {
    const record = await prisma.verificationToken.findFirst({
      where: { email, token: otp },
      orderBy: { expires: 'desc' }
    });

    if (!record || record.expires < new Date()) {
      return { success: false, error: 'Invalid or expired OTP' };
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: 'User not found' };

    // OTP is valid! Destroy it so it can't be reused
    await prisma.verificationToken.delete({ where: { id: record.id } });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Create secure session cookie directly in the browser
    await createSession(user.id);

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'An error occurred verifying OTP' };
  }
}

export async function hasPasskeysAction(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { authenticators: true }
    });
    return (user?.authenticators?.length ?? 0) > 0;
  } catch (error) {
    console.error(error);
    return false;
  }
}
