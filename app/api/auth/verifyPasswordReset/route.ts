import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/encrypt';
import { z } from 'zod';
import db from '@/lib/db';
import { createResetPasswordSession } from '@/lib/session';
import { cookies } from 'next/headers';
// Define a jwt schema for input Validation
const jwtSchema = z.object({
    session: z.string().min(1),
})

export async function GET(req: NextRequest) {
    try {
        // Grab the encrypted session data from the sessionId url parameter
        const { searchParams } = new URL(req.url);
        const session = searchParams.get('session');

        const { session: sessionString} = jwtSchema.parse({ session });
        const decryptedSession = await decrypt(sessionString);
        // check that the session isn't expired

        if (decryptedSession.expiresAt < new Date()) {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
        }

        const sessionData = await db.resetPassword.findUnique({
            where: { 
                sessionId: decryptedSession.sessionId,
                userId: decryptedSession.userId
            }
        })


        // Check if the session exists
        if (!sessionData) {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
        }


        // Check if the resetPassword was used already
        if (sessionData.used) {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
        }

        // Check if the user exists
        const user = await db.user.findUnique({
            where: { id: sessionData.userId }
        })

        // Check if the user exists
        if (!user) {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
        }

        // Log the link as used
        await db.resetPassword.update({
            where: { sessionId: decryptedSession.sessionId },
            data: { used: true }
        })

        // Check if their is already a session 
        const cookieSession = cookies().get('session')

        if (!cookieSession) {
            // Since their is no cookie sesion
            // In example the user clicks on the link from a different device, set their cookie session

            cookies().set('session', sessionString, {
                expires: decryptedSession.expiresAt,
                httpOnly: true, // Optional but recommended for security
                secure: true,   // Ensure cookies are only sent over HTTPS
                sameSite: 'strict', // Optional but helps prevent CSRF attacks
                path: '/',     // Optional, limits the scope of the cookie
        });

        } 

        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/reset-password`)

    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}