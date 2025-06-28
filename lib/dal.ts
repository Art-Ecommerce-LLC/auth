import 'server-only'
 
import { cookies } from 'next/headers'
import { decrypt } from './encrypt'
import { cache } from 'react'
import db from './db'
import { SessionData } from '@/models/models'


export const getSessionData = cache(async (pageType: string): Promise<SessionData> => {
    try {
        let session: SessionData = { isAuth: false };
        const cookie = (await cookies()).get(pageType)?.value;

        if (!cookie) {
            return {
                isAuth: false,
                error: 'No session cookie found.'
            };
        }

        const decryptedSession = await decrypt(cookie);

        if (!decryptedSession.userId) {
            return {
                isAuth: false,
                error: 'Invalid session data.'
            };
        }


        switch (pageType) {
            case 'resetPassword':
                const resetPasswordSession = await db.resetPassword.findUnique({
                    where: { userId: decryptedSession.userId }
                });
                if (!resetPasswordSession) {
                    return {
                        isAuth: false,
                        error: 'No reset password session found.'
                    };
                }
                session = {
                    isAuth: true,
                };
                
                break;
            case 'verifyEmail':
                const verifyEmailSession = await db.emailVerification.findUnique({
                    where: { userId: decryptedSession.userId }
                });
                if (!verifyEmailSession) {
                    return { 
                        isAuth: false ,
                        error: 'No email verification session found.'
                    };
                }
                session = {
                    isAuth: true,
                };
                break;
            case 'otp':
                const otpSession = await db.oTP.findUnique({
                    where: { userId: decryptedSession.userId }
                });
                if (!otpSession) {
                    return { 
                        isAuth: false,
                        error: 'No OTP session found.'
                    };
                }
                session = { 
                    isAuth: true
                };
                break;
            case 'session':
                const sessionDb = await db.session.findUnique({
                    where: { id: decryptedSession.sessionId }
                });
                if (!sessionDb) {
                    return { 
                        isAuth: false, 
                        error: 'No session found in the database.'
                    };
                }
                if (!sessionDb.mfaVerified) {
                    return { 
                        isAuth: false, 
                        mfaVerified: false,
                        error: 'MFA not verified.'
                    };
                }
                if (!sessionDb.userId) {
                    return { 
                        isAuth: false, 
                        error: 'No user ID found in the session.'
                    };
                }
                // Get some of the user data from the session
                const userDB = await db.user.findUnique({
                    where: { id: sessionDb.userId }
                });
                if (!userDB) {
                    return {
                        isAuth: false, 
                        error: 'No user found in the database.'
                    };
                }
                session = { 
                    isAuth: true, 
                    mfaVerified: sessionDb.mfaVerified,
                    userId: decryptedSession.userId,
                    email: userDB.email,
                    role: userDB.role,
                    planStatus: userDB.planStatus,
                };
                break;
            default:
                const user = await db.user.findUnique({
                    where: { id: decryptedSession.userId }
                });
                if (!user) {
                    return { 
                        isAuth: false, 
                        error: 'No user found in the database.'
                    };
                }
                session = { 
                    isAuth: true, 
                    userId: user.id,
                    username: user.username,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    role: user.role,
                    planStatus: user.planStatus,
                    serviceToken: user.serviceToken
                };
        }
        return session;
    } catch (error) {
        return { 
            isAuth: false, 
            error: 'Something went wrong while fetching session data.'
        };
    }
});
