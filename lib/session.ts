'use server';
 
import { cookies } from 'next/headers';
import db from './db';
import { encrypt } from './encrypt';

// The createSession function to handle session creation
export async function createSession(id: string) : Promise<string> {
  try {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 1. Create a session in the database
    const data = await db.session.create({
      data: {
        userId: id,
        expiresAt,
      },
    });
  
    const sessionId = data.sessionId;
  
    // 2. Encrypt the session ID and expiration
    const session = await encrypt({ sessionId, expiresAt });
    const isProduction = process.env.NODE_ENV === 'production';
    // 3. Store the session in cookies for optimistic auth checks
    cookies().set('session', session, {
      httpOnly: true,
      secure: isProduction,
      expires: expiresAt,
      sameSite: 'strict',
      path: '/',
    });
    return session;
  } catch (error) {
    throw new Error('Session creation failed');
  }
}

export async function deleteSession(sessionId: string) {
    // 1. Remove the session from the database
    try {
        await db.session.delete({
            where: { sessionId: sessionId },
        });
    
        // 2. Remove the session from the cookies
        const cookieStore = cookies();
        cookieStore.delete('session');
    }
    catch (error) {
        throw new Error("Error deleting session");
    }
}

// Function to generate a unique 6-digit OTP and create a session
export async function createOTPSession(sessionId: string): Promise<string> {
  try {
    let otp: string;
    let otpExists = true;

    // Loop until we find a unique OTP
    do {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
      const existingOTP = await db.oTP.findUnique({
        where: { otp },
      });
      otpExists = !!existingOTP; // If OTP exists, repeat the loop
    } while (otpExists);

    // Get the current time
    const dateNow = new Date();

    // Store the unique OTP in the database, with an expiration time of 5 minutes
     await db.oTP.create({
      data: {
        sessionId,
        otp,
        updatedAt: dateNow,
        createdAt: dateNow,
        expiresAt: new Date(dateNow.getTime() + 5 * 60 * 1000), // 5 minutes from now
      },
    });
    // Return the generated OTP (or handle it as needed)
    return otp;
  } catch (error) {
    throw new Error("Unable to create OTP session");
  }
}

export async function deleteOTPSessions(sessionId: string) {
    // 1. Remove all OTPs associated with the session from the database
    try {
        await db.oTP.deleteMany({
            where: { sessionId: sessionId },
        });
    }
    catch (error) {
        throw new Error("Error deleting OTP sessions");
    }
}

export async function createResetPasswordSession(userId : string, token : string, expiresA) : Promise<string> {
    try {
        // 1. Create a reset password session in the databaseß
        const data = await db.resetPassword.create({
            data: {
                userId: userId,ß
                token:
            },
        });
        const sessionId = data.sessionId;
        return sessionId;
    } catch (error) {
        throw new Error('Reset password session creation failed');
    }
}