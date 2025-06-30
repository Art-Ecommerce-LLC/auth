import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/encrypt';
import { z } from 'zod';
import db from '@/lib/db';
import { compare } from 'bcrypt';
import { createCookie } from '@/lib/cookie';
import { create } from 'domain';

const jwtSchema = z.object({
    session: z.string().min(1),
})

export async function GET(request: NextRequest) {
    try {
        // Grab the encrypted session data from the sessionId url parameter
        const { searchParams } = new URL(request.url);
        const session = searchParams.get('verifyPassword');

        // Put session through jwt schema
        const { session: sessionJWE } = jwtSchema.parse({ session });

        if (!sessionJWE) {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
        }

        const sessionCookie = await decrypt(sessionJWE);
    
        const sessionData = await db.resetPassword.findUnique({
            where: { 
                userId: sessionCookie.userId,
            }
        })

        if (!sessionData) {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
        }

        const isValidToken = await compare(sessionCookie.token!, sessionData.token!);

        if (!isValidToken) {
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
        
        // If the cookie in the session is the same cookie as the one in the request headers then do not create the session
        // Otherwise since it isn't there store the cookie in the request into the session cookie
        if (session !== request.cookies.get('resetPassword')?.value) {
            // Store the session in the request cookies
            createCookie('resetPassword', sessionJWE, new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)); // 7 days expiration
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/reset-password`)
        }
        // If the session is valid, redirect to the reset password page
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/reset-password`)

    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}