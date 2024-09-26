import 'server-only'
 
import { cookies } from 'next/headers'
import { decrypt } from './encrypt'
import { cache } from 'react'
import db from './db'

export const validateSession = cache(async (sessionType: string) => {
  // Get session from cookies

  const session = cookies().get(sessionType);
  console.log(session);
  if (!session) {
      return { user: null, session: null }; // No session found in cookies
  }

  const sessionCookie = await decrypt(session.value);
  console.log(sessionCookie);
  if (!sessionCookie) { 
      console.log('Session cookie could not be decrypted')
      return { user: null, session: null }; // Session cookie could not be decrypted
  }

  // Query the session from the database
  let sessionRecord;
  try {
      // Query the appropriate session table based on the session type
      switch (sessionType) {
          case 'session':
              sessionRecord = await db.session.findUnique({
                  where: { id: sessionCookie.sessionId },
              });
              break;
          case 'verifyEmail':
              sessionRecord = await db.emailVerification.findUnique({
                  where: { userId: sessionCookie.userId },
              });

              break;
          case 'resetPassword':
              sessionRecord = await db.resetPassword.findUnique({
                  where: { userId: sessionCookie.userId },
              });
              break;
          case 'otp':
              sessionRecord = await db.oTP.findUnique({
                  where: { userId: sessionCookie.userId },
              });
              break;
          default:
              throw new Error('Invalid session type');
      }

      // If no session record is found, return false
      if (!sessionRecord) {
          return { user: null, session: null };
      }

  } catch (error) {
      return { user: null, session: null };
  }

  // Get user without the password
    const user = await db.user.findUnique({
        where: { id: sessionCookie.userId },
        // select: { password: false },
    });

    if (!user) {
        return { user: null, session: null };
    }

    const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, session: sessionRecord };
});

