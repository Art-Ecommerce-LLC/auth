'use server';

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { decrypt } from "@/lib/encrypt";
import { deleteSession, createSession } from "@/lib/session";
import { cookies } from "next/headers";
import { sendVerificationEmail } from "@/app/utils/mail";

export async function POST() {
    try {
        const body = cookies();
        // Grab the session from the cookies
        const session = body.get('session');

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }
        const decryptedSession = await decrypt(session.value);

        // Check if the session hasn't expired
        const decryptedDate = new Date(decryptedSession.expiresAt);
        if (decryptedDate < new Date()) {
            return NextResponse.json({ error: "Session expired" }, { status: 401 })
        }

        const sessionData = await db.session.findUnique({
            where: { sessionId: decryptedSession.sessionId }
        })

        // Check if the session exists
        if (!sessionData) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }
                // Update the session with a new token and expiration

        // Check if the user exists
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
        await deleteSession(sessionData.sessionId);
        const newSession = await createSession(user.id);

        // Send the email verification
        await sendVerificationEmail({
            to: user.email!,
            session : newSession
        })

        return NextResponse.json({success: "success "}, {status:200})
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}