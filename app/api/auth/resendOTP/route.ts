'use server';

import { NextResponse } from "next/server";
import db from "@/lib/db";
import { decrypt } from "@/lib/encrypt";
import { cookies } from "next/headers";
import { sendEmail } from "@/app/utils/mail";
import { compare } from "bcrypt";
import { deleteSession, manageSession } from "@/lib/session";

export async function POST() {
    try {
        const session = cookies().get('otp');

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }

        // Decrypt the session and validate it
        const sessionCookie = await decrypt(session.value);

        const sessionData = await db.oTP.findUnique({
            where: { userId: sessionCookie.userId }
        })

        if (!sessionData) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }

        // Compare otp session and otp token
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

        // Delete the existing otp session and make a new one
        await deleteSession({ userId: user.id, cookieNames: ['otp'] })
        const newSession = await manageSession({ userId: user.id, sessionType: 'otp'})


        await sendEmail({
            to: user.email,
            type: "otp",
            session: newSession.token
        });
    
        return NextResponse.json({success: "success "}, {status:200})
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}