import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/encrypt';
import { z } from 'zod';
import db from '@/lib/db';
import { cookies } from 'next/headers';
import { createSession } from '@/lib/session';
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

        const sessionData = await db.session.findUnique({
            where: { sessionId: decryptedSession.sessionId }
        })

        // Check if the session exists
        if (!sessionData) {
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

        // Check if there is a cookie session
        const cookieSession = cookies().get('session');
        if (!cookieSession) {
            await createSession(user.id);
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/reset-password`)
        }
        
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/reset-password`)

    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}