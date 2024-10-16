'server only';

import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import db from "@/app/lib/db";
import { decrypt } from "@/app/lib/encrypt";
import { cookies } from "next/headers";
import { sendEmail } from "@/app/utils/mail";
import { compare } from "bcrypt";
import { deleteSession, manageSession } from "@/app/lib/session";

export async function POST(request : NextRequest) {
    try {
        const session = cookies().get('verifyEmail');
 
        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }

        const sessionCookie = await decrypt(session.value);
        const sessionData = await db.emailVerification.findUnique({
            where: { userId : sessionCookie.userId }
        })

        if (!sessionData) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }

        // Compare the session token
        const isValid = await compare(sessionCookie.token, sessionData.token)

        if (!isValid) {
            return NextResponse.json({ error: "Invalid session" }, { status: 401 })
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
        // Delete the previous session and make a new one

        await deleteSession({ userId: user.id, cookieNames: ['verifyEmail'], request})
        const newSession = await manageSession({ userId: user.id, sessionType: 'verifyEmail'})

        if (!newSession) {
            return NextResponse.json({ error: "Session creation failed" }, { status: 500 })
        }

        await sendEmail({
            to: user.email,
            type: "verifyEmail",
            session: newSession.token
        })

        return NextResponse.json({success: "success "}, {status:200})
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}