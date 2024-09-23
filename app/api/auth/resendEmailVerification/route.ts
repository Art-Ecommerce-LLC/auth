'server only';

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { decrypt } from "@/lib/encrypt";
import { cookies } from "next/headers";
import { sendEmail } from "@/app/utils/mail";

export async function POST() {
    try {
        const session = cookies().get('verifyEmail');

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }

        // Validate the session in decrypt
        const decryptedSession = await decrypt(session.value);

        const sessionData = await db.emailVerification.findUnique({
            where: { token: decryptedSession }
        })

        // Check if the session exists
        if (!sessionData) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }

        const user = await db.user.findUnique({
            where: { id: sessionData.userId }
        })

        // Check if the user exists
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Check if the email was already verified
        if (user.emailVerified) {
            return NextResponse.json({ error: "Email already verified" }, { status: 409 })
        }

        // Send the email verification
        await sendEmail({
            to: user.email,
            type: "verifyEmail",
            session: session.value
        })

        return NextResponse.json({success: "success "}, {status:200})
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}