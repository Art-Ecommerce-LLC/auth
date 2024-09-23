import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/encrypt';
import { z } from 'zod';
import db from '@/lib/db';

const jwtSchema = z.object({
    session: z.string().min(1),
})

export async function GET(req: NextRequest) {
    try {
        // Grab the encrypted session data from the sessionId url parameter
        const { searchParams } = new URL(req.url);
        const session = searchParams.get('session');

        // Put session through jwt schema
        const { session: sessionJWE } = jwtSchema.parse({ session });

        if (!sessionJWE) {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
        }

        const token = await decrypt(sessionJWE);
    
        const sessionData = await db.resetPassword.findUnique({
            where: { 
                token
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
            where: { id: sessionData.id },
            data: {
                used: true
            }
        })

        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/reset-password`)

    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}