'use server';
 
import { cookies } from 'next/headers';
import db from './db';
import { encrypt } from './encrypt';

// The createSession function to handle session creation
export async function createSession(id: string) : Promise<string> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // 1. Create a session in the database
  const data = await db.session.create({
    data: {
      userId: id,
      expiresAt,
    },
  });

  const sessionId = data.id;

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
  console.log(cookies().get('session'));
  return session;
}

export async function deleteSession(sessionId: string) {
    // 1. Remove the session from the database
    try {
        await db.session.delete({
            where: { id: sessionId },
        });
    
        // 2. Remove the session from the cookies
        const cookieStore = cookies();
        cookieStore.delete('session');
        console.log('Session deleted');
    }
    catch (error) {
        console.error(error);
    }
}
