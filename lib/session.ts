import db from './db';
import { encrypt } from './encrypt';
import { hash } from 'bcrypt';
import { createId } from '@paralleldrive/cuid2';
import { deleteCookie, createCookie } from './cookie';
import { IP } from '@/app/utils/ip';

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
const createSessionData = async (sessionType: string, userId: string): 
Promise<{ token: string; expiresAt: Date } | { token: string; expiresAt: Date; otp: string }> => {
  const expiresAt = getExpirationTime(sessionType);
  let token: string;
  let hashedToken: string | null = null;
  let otp: string;
  let hashedOtp: string | null = null;

  switch (sessionType) {
    case 'session':

      // Check if a session already exists for the user
      const recentSession = await db.session.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      // If a session exists and is not expired, return the existing token
      if (recentSession && recentSession.expiresAt > new Date()) {
        return { token: recentSession.token, expiresAt: recentSession.expiresAt };
      }

      token = createId(); // If sessionId is not provided, generate one
      hashedToken = await hash(token, 10);
      const ipAddress = IP(); // Call the IP function to get the IP address
      await db.session.create({
        data: {
          userId,
          expiresAt,
          ipAddress,
          token: hashedToken,
        },
      });
      break;
    case 'verifyEmail':
    case 'resetPassword':
      token = createId();
      console.log(token);
      hashedToken = await hash(token, 10);
      console.log(hashedToken);
      if (sessionType === 'verifyEmail') {
        await db.emailVerification.create({
          data: {
            userId,
            token: hashedToken,
            expiresAt,
          },
        });
      } else {
        await db.resetPassword.create({
          data: {
            userId,
            token: hashedToken,
            expiresAt,
          },
        });
      }
      break;
    case 'otp':
      const existingOtp = await db.oTP.findUnique({
        where: {
          userId,
          expiresAt: {
            gt: new Date(), // OTP is valid if it expires in the future
          },
        },
      });

      if (existingOtp) {
        // If a valid OTP exists, return it instead of creating a new one
        return { token: existingOtp.token, expiresAt: existingOtp.expiresAt, otp: existingOtp.otp };
      }
      const existingSession = await db.session.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      if (!existingSession) {
        throw new Error('No session exists for the user to link the OTP');
      }

      otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate OTP
      hashedOtp = await hash(otp, 10);
      token = existingSession.token;
      await db.oTP.create({
        data: {
          otp: hashedOtp,
          expiresAt,
          userId,
          token,
        },
      });

      return { token, expiresAt, otp };
    default:
      throw new Error('Unsupported session type');
  }

  return { token, expiresAt};
};

// Unified function for creating different sessions
export async function manageSession({
  userId,
  sessionType,
  encryptSession = true
}: {
  userId: string;
  sessionType: string;
  encryptSession?: boolean; // Optional
}) {
  try {
    const { token, expiresAt} = await createSessionData(sessionType, userId);

    // Encrypt the token or sessionId if encryptSession is true
    const finalToken = await encrypt({ token, expiresAt, userId });
    createCookie(sessionType, finalToken, expiresAt);

    if (!encryptSession) {
      return { token, expiresAt, userId };
    } else {
      return { token: finalToken, expiresAt, userId };
    }

  } catch (error) {
    throw new Error(`${sessionType} creation failed: ${error}`);
  }
}

export async function deleteSession({
  userId,
  cookieNames = [],
  deleteAllSessions = false
}: {
  userId: string;
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
        deleteCookie('session');
      } catch {
        console.log('Error deleting session cookie');
      }

      try {
        deleteCookie('verifyEmail');
      } catch {
        console.log('Error deleting verifyEmail cookie');
      }

      try {
        deleteCookie('otp');
      } catch {
        console.log('Error deleting OTP cookie');
      }

      try {
        deleteCookie('resetPassword');
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
        deleteCookie(cookieName);
      } catch {
        console.log(`Error deleting ${cookieName} cookie`);
      }
    }
  } catch {
    console.log('Error during session deletion process');
  }
}