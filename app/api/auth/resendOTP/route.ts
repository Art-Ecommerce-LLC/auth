'use server';

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { decrypt } from "@/lib/encrypt";
import { cookies } from "next/headers";
import { sendEmail } from "@/app/utils/mail";

export async function POST() {
    try {
        const session = cookies().get('session');

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }

        // Decrypt the session and validate it
        const decryptedSession = await decrypt(session.value);

        const sessionData = await db.session.findUnique({
            where: { sessionId: decryptedSession }
        })

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

        await sendEmail({
            to: user.email,
            type: "otp",
            session: session.value
        });
    
        return NextResponse.json({success: "success "}, {status:200})
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}