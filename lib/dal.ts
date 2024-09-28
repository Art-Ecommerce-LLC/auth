import 'server-only'
 
import { cookies } from 'next/headers'
import { decrypt } from './encrypt'
import { cache } from 'react'
import db from './db'

export const verifySession = cache(async () => {
    const cookie = cookies().get('session')?.value

    if (!cookie) {
        return { isAuth: false}
    }
    const session = await decrypt(cookie)
   
    if (!session.userId) {
        return { isAuth: false}
    }
   
    return { isAuth: true, userId: session.userId }
})

export const getUser = cache(async () => {
const session = await verifySession()
if (!session.isAuth) {
    return { isAuth: false}
}
try {
    const user = await db.user.findUnique({
        where: { 
            id: session.userId
        }
    })

    if (!user) {
        return { isAuth: false}
    }
    
    const { password , id, email, updatedAt, createdAt,  ...rest } = user
    return rest
} catch (error) {
    return { isAuth: false}
}
})

export const getOTPSession = cache(async () => {
    const cookie = cookies().get('otp')?.value
    if (!cookie) {
        return { isAuth: false}
    }
    try {
        const session = await decrypt(cookie)
    if (!session.userId) {
        return { isAuth: false}
    }

    // Check if the user has an active OTP session
    const otpSession = await db.oTP.findUnique({
        where: {
            userId: session.userId
        }
    })
    if (!otpSession) {
        return { isAuth: false}
    }

    return { isAuth: true }
    } catch (error) {
        return { isAuth: false}
    }   
})


export const getVerifyEmailSession = cache(async () => {
    const cookie = cookies().get('verify-email')?.value
    if (!cookie) {
        return { isAuth: false}
    }
    const session = await decrypt(cookie)

    if (!session.userId) {
        return { isAuth: false}
    }

    try {
        const emailVerification = await db.emailVerification.findUnique({
            where: {
                userId: session.userId
            }
        })
        if (!emailVerification) {
            return { isAuth: false}
        }
        return { isAuth: true }
    } catch (error) {
        return { isAuth: false}
    }
});

export const getResetPasswordSession = cache(async () => {
    const cookie = cookies().get('resetPassword')?.value
    if (!cookie) {
        return { isAuth: false}
    }
    const session = await decrypt(cookie)
    if (!session.userId) {
        return { isAuth: false}
    }
    try {
        // Check if the user has an active reset password session
        const resetPassword = await db.resetPassword.findUnique({
            where: {
                userId: session.userId
            }
        })
        if (!resetPassword) {
            return { isAuth: false}
        }

        return { isAuth: true }
    } catch (error) {
        return { isAuth: false}
    }
});

export const getSession = cache(async () => {
    const cookie = cookies().get('session')?.value
    if (!cookie) {
        return { isAuth: false}
    }
    const session = await decrypt(cookie)
    if (!session.userId) {
        return { isAuth: false}
    }
    // Find the sessionid in the database
    try {
        const sessionDb = await db.session.findUnique({
            where: {
                id: session.sessionId
            }
        })
        if (!sessionDb) {
            return { isAuth: false}
        }
        return { isAuth: true, session: sessionDb }
    } catch (error) {
        return { isAuth: false}
    }
});

export const getSessionData = cache(async (pageType: string) => {
    try {
        let session;
        const user = await getUser()
        switch (pageType) {
            case 'resetPassword':
                session = await getResetPasswordSession()
                return { isAuth: session.isAuth, user };
            case 'verifyEmail':
                session = await getVerifyEmailSession()
                return { isAuth: session.isAuth, user };
            case 'otp':
                session = await getOTPSession()
                return { isAuth: session.isAuth, user };
            case 'session':
                session = await getSession()
                if (!session) {
                    return { isAuth: false }
                }
                if (!session.session) {
                    return { isAuth: false }
                }
                return { isAuth: session.isAuth, user, mfaVerified: session.session.mfaVerified };
            default:
                return { isAuth: false }; 
        }}catch (error) {
        return { isAuth: false }
    }
});