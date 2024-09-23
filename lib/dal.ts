import 'server-only'
 
import { cookies } from 'next/headers'
import { decrypt } from './encrypt'
import { cache } from 'react'
import db from './db'
import { hash } from 'bcrypt' 

export const validateSession = cache(async (sessionType: string) => {
  // Get session from cookies
  console.log('sessionType: '+sessionType)
  const sessionCookie = cookies().get(sessionType);
  console.log('scookie: '+sessionCookie)
  if (!sessionCookie) {
      return false; // No session found in cookies
  }

  const decryptedToken = await decrypt(sessionCookie.value);

  if (!decryptedToken) { 
      return false; // Session cookie could not be decrypted
  }

  // Query the session from the database
  let sessionRecord;
  let token;
  token = await hash(decryptedToken, 10);
  try {
      // Query the appropriate session table based on the session type
      switch (sessionType) {
          case 'session':
              sessionRecord = await db.session.findUnique({
                  where: { token },
              });
              break;
          case 'verifyEmail':
              sessionRecord = await db.emailVerification.findUnique({
                  where: { token },
              });
              break;
          case 'resetPassword':
              sessionRecord = await db.resetPassword.findUnique({
                  where: { token },
              });
              break;
          case 'otp':
              sessionRecord = await db.oTP.findUnique({
                  where: { token },
              });
              break;
          default:
              throw new Error('Invalid session type');
      }

      // If no session record is found, return false
      if (!sessionRecord) {
          return false;
      }

      // Check if the session has expired in the database as well
      if (new Date() > sessionRecord.expiresAt) {
          return false;
      }
  } catch (error) {
      console.error(`Error querying the ${sessionType} session from database`, error);
      return false;
  }

  // Return the session record if everything is valid
  return sessionRecord;
});

