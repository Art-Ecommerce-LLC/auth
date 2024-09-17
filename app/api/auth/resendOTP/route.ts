'use server';

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { decrypt } from "@/lib/encrypt";
import { deleteOTPSessions, createOTPSession} from "@/lib/session";
import { cookies } from "next/headers";
import { sendOTPEmail } from "@/app/utils/mail";

export async function POST() {
    try {
        const body = cookies();
        // Grab the session from the cookies
        const session = body.get('session');

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }
        const decryptedSession = await decrypt(session.value);

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

        await deleteOTPSessions(sessionData.sessionId);
        const otp = await createOTPSession(sessionData.sessionId);
        
        // Send the OTP
        await sendOTPEmail({
            to: user.email!,
            otp: otp
        });
        

        return NextResponse.json({success: "success "}, {status:200})
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}