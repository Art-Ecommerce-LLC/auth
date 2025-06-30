'use server';

import db from './db';
import { encrypt } from './encrypt';
import { hash } from 'bcrypt';
import { createId } from '@paralleldrive/cuid2';
import { deleteCookie, createCookie } from './cookie';
import { IP } from '@/utils/ip';
import { NextRequest } from 'next/server';

// Helper to determine expiration based on session type
const getExpirationTime = (sessionType: string): Date => {
  switch (sessionType) {
    case 'session':
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days for normal session
    case 'verifyEmail':
    case 'resetPassword':
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day for email verification and reset password
    case 'otp':
      return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes for OTP
    default:
      throw new Error('Invalid session type');
  }
};

// Helper to create session data
const createSessionData = async (sessionType: string, userId: string, mfaVerified = false, sessionId?: string): 
Promise<{ token: string; expiresAt: Date, userId: string } | 
{ token: string; expiresAt: Date; userId: string, sessionId: string } |
{token: string; expiresAt: Date; userId: string, otp: string}> => {
  const expiresAt = getExpirationTime(sessionType);
  const newSessionToken = createId();
  const existingToken = await hash(newSessionToken, 10);

  let hashedToken: string | null = null;
  let otp: string;
  let hashedOtp: string | null = null;

  const token = createId();
  hashedToken = await hash(token, 10);

  switch (sessionType) {
    case 'session':
      const recentSession = await db.session.findUnique({
        where: { userId,
          id: sessionId
         },
      });

      // If a session exists and is not expired, return the existing token
      if (recentSession) {
        await db.session.update({
          where: { id: sessionId},
          data: {
            token: existingToken,
            expiresAt,
            mfaVerified
          },
        });

        return { token: newSessionToken, expiresAt, userId, sessionId };
      }

      hashedToken = await hash(newSessionToken, 10);
      const ipAddress = await IP(); // Call the IP function to get the IP address
      const newSession = await db.session.create({
        data: {
          userId,
          expiresAt,
          ipAddress,
          token: hashedToken,
          mfaVerified
        },
      });
      return {token: newSessionToken, expiresAt, userId, sessionId: newSession.id }
    case 'verifyEmail':
      // Check if a valid email verification exists
      const existingEmailVerification = await db.emailVerification.findUnique({
        where: { userId },
      });
      if (existingEmailVerification) {
        // If a valid email verification exists, return it instead of creating a new one
        // Create a new one and store it since it is hashed
        await db.emailVerification.update({
          where: { id: existingEmailVerification.id },
          data: { token: hashedToken, expiresAt },
        });
        return { token, expiresAt, userId };
      }
      await db.emailVerification.create({
        data: {
          userId,
          token: hashedToken,
          expiresAt,
        },
      });
     
      return { token, expiresAt, userId };
    case 'resetPassword':
      // Check if a valid reset password exists
      const existingResetPassword = await db.resetPassword.findUnique({
        where: { userId },
      });
      if (existingResetPassword) {
        // If a valid reset password exists, return it instead of creating a new one
        // Create a new one and store it since it is hashed
        console.log(token,hashedToken)
        await db.resetPassword.update({
          where: { id: existingResetPassword.id },
          data: { token: hashedToken, expiresAt },
        });
        return { token, expiresAt, userId };
      }
      
      await db.resetPassword.create({
        data: {
          userId,
          token: hashedToken,
          expiresAt,
        },
      });
      
      return { token, expiresAt, userId };
    case 'otp':
      const existingOtp = await db.oTP.findUnique({
        where: {
          userId,
        },
      });

      if (existingOtp) {
        // If a valid OTP exists, return it instead of creating a new one
        // Create a new one and store it since it is hashed
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const newHashedOtp = await hash(newOtp, 10);
        await db.oTP.update({
          where: { id: existingOtp.id },
          data: { 
            otp: newHashedOtp,
            expiresAt,
            token: hashedToken,
          
          },
        });
        return { token, expiresAt, userId, otp: newOtp };

      }
      otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate OTP
      hashedOtp = await hash(otp, 10);
      await db.oTP.create({
        data: {
          otp: hashedOtp,
          expiresAt,
          userId,
          token: hashedToken,
        },
      });
      return { token, expiresAt, userId, otp };
    default:
      throw new Error('Unsupported session type');
  }
};

// Unified function for creating different sessions
export async function manageSession({
  userId,
  sessionType,
  mfaVerified = false,
  sessionId = '',
  storeSession = true
}: {
  userId: string;
  sessionType: string;
  mfaVerified?: boolean;
  sessionId?: string // Optional
  storeSession?: boolean; // Optional
}) : Promise<{ 
  token: string; 
  expiresAt: Date } | 
  { token: string; 
    expiresAt: Date;
    sessionId: string} |
    { token: string; 
      expiresAt: Date;
      otp: string}> {
  try {
    // Create session data make switch case for different session types and return values
    let sessionJWT;
    let finalToken
    switch (sessionType) {
      case 'session':
        sessionJWT = await createSessionData(sessionType, userId, mfaVerified, sessionId);
        finalToken = await encrypt(sessionJWT);
        createCookie(sessionType, finalToken, sessionJWT.expiresAt);

        if (!('sessionId' in sessionJWT)) {
          throw new Error('Error in session')
        }

        return { token: finalToken, expiresAt: sessionJWT.expiresAt, sessionId: sessionJWT.sessionId};
      case 'verifyEmail':

        sessionJWT = await createSessionData(sessionType, userId, mfaVerified);
        finalToken = await encrypt(sessionJWT);
        createCookie(sessionType, finalToken, sessionJWT.expiresAt);
        console.log('cookie was created');
        return { token: finalToken, expiresAt: sessionJWT.expiresAt};

      case 'resetPassword':

        sessionJWT = await createSessionData(sessionType, userId, mfaVerified);
        finalToken = await encrypt(sessionJWT);
        if (storeSession) {
          createCookie(sessionType, finalToken, sessionJWT.expiresAt);
          console.log('cookie was created');
        }
        return { token: finalToken, expiresAt: sessionJWT.expiresAt};

      case 'otp':
        sessionJWT = await createSessionData(sessionType, userId, mfaVerified);
        finalToken = await encrypt(sessionJWT);
        createCookie(sessionType, finalToken, sessionJWT.expiresAt);
        
        if (!('otp' in sessionJWT)) {
          throw new Error('error occured in otp')
        }
        return { token: finalToken, expiresAt: sessionJWT.expiresAt, otp: sessionJWT.otp};
      default:
        throw new Error('Unsupported session type');
    }
  } catch (error) {
    throw new Error(`${sessionType} creation failed: ${error}`);
  }
}

export async function deleteSession({
  userId,
  request,
  cookieNames = [],
  deleteAllSessions = false
}: {
  userId: string;
  request: NextRequest; // Optional, defaults to null
  cookieNames?: string[]; // A list of session types to delete
  deleteAllSessions?: boolean; // Optional, defaults to false
}) {
  try {
    if (deleteAllSessions) {
      // Try to delete all session-related data for the user
      try {
        await db.session.deleteMany({ where: { userId } });
      } catch {
        console.log('Error deleting session data');
      }

      try {
        await db.emailVerification.deleteMany({ where: { userId } });
      } catch {
        console.log('Error deleting email verification data');
      }

      try {
        await db.oTP.deleteMany({ where: { userId } });
      } catch {
        console.log('Error deleting OTP data');
      }

      try {
        await db.resetPassword.deleteMany({ where: { userId } });
      } catch {
        console.log('Error deleting reset password data');
      }

      // Try to delete all session-related cookies
      try {
        deleteCookie('session', request);
      } catch {
        console.log('Error deleting session cookie');
      }

      try {
        deleteCookie('verifyEmail', request);
      } catch {
        console.log('Error deleting verifyEmail cookie');
      }

      try {
        deleteCookie('otp', request);
      } catch {
        console.log('Error deleting OTP cookie');
      }

      try {
        deleteCookie('resetPassword', request);
      } catch {
        console.log('Error deleting resetPassword cookie');
      }

      return;
    }

    if (!cookieNames || cookieNames.length === 0) {
      throw new Error('Cookie names are required if not deleting all sessions');
    }

    // Loop through the list of cookie names and delete sessions accordingly
    for (const cookieName of cookieNames) {
      try {
        switch (cookieName) {
          case 'session':
            await db.session.deleteMany({ where: { userId } });
            break;
          case 'verifyEmail':
            await db.emailVerification.deleteMany({ where: { userId } });
            break;
          case 'otp':
            await db.oTP.deleteMany({ where: { userId } });
            break;
          case 'resetPassword':
            await db.resetPassword.deleteMany({ where: { userId } });
            break;
          default:
            console.log(`Invalid cookie name: ${cookieName}`);
        }
      } catch {
        console.log(`Error deleting ${cookieName} session data`);
      }

      // Try to delete the corresponding cookie
      try {
        deleteCookie(cookieName, request);
      } catch {
        console.log(`Error deleting ${cookieName} cookie`);
      }
    }
  } catch {
    console.log('Error during session deletion process');
  }
}