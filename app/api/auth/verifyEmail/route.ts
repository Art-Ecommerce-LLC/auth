import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";
import * as z from "zod";
import { decrypt } from "@/lib/encrypt";

// Define a jwt schema for input Validation
const jwtSchema = z.object({
    session: z.string().min(1),
})

export async function GET(req: NextRequest) {
    try {
        // Grab the encrypted session data from the sessionId url parameter
        const { searchParams } = new URL(req.url);
        const session = searchParams.get('session');

        if (!session) {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
        }

        const decryptedSession = await decrypt(session);

        const sessionData = await db.session.findUnique({
            where: { sessionId: decryptedSession}
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

        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/verified-email`)
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}