import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";
import * as z from "zod";
import { decrypt } from "@//lib/encrypt";
import { compare } from "bcrypt";
import { deleteSession } from "@/lib/session";

// Define a jwt schema for input Validation
const jwtSchema = z.object({
    session: z.string().min(1),
})

export async function GET(request: NextRequest) {
    try {
        // Grab the encrypted session data from the sessionId url parameter
        const { searchParams } = new URL(request.url);
        const session = searchParams.get('verifyEmail');
        
        // Validate the session
        const { session: sessionData } = jwtSchema.parse({ session });

        if (!sessionData) {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
        }

        const sessionCookie = await decrypt(sessionData);
        const sessionDBData = await db.emailVerification.findUnique({
            where: { userId: sessionCookie.userId}
        })

        
        if (!sessionDBData) {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
        }


        // Compare the token to the token in the databse with bcrypt
        const isTokenValid = await compare(sessionCookie.token, sessionDBData.token);

        if (!isTokenValid) {
            console.log('Token is invalid')
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
        }

        const user = await db.user.findUnique({
            where: { id: sessionDBData.userId }
        })

        // Check if the user exists
        if (!user) {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
        }

        // Check if the email was already verified
        if (user.emailVerified) {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
        }

        // Verify the email
        await db.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true
            }
        })

        deleteSession({ userId: user.id, cookieNames: ['verifyEmail'], request: request })

        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/verified-email`)
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}