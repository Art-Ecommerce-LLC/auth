'use server';

import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";
import { decrypt } from "@/lib/encrypt";
import { cookies } from "next/headers";
import { sendEmail } from "@/app/utils/mail";
import { compare } from "bcrypt";
import { deleteSession, manageSession } from "@/lib/session";

export async function POST(request: NextRequest) {
    try {
        const session = cookies().get('resetPassword');

        if (!session) {
            console.log("Session not found")
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }

        // Decrypt the session and validate it
        const sessionCookie = await decrypt(session.value);

        const sessionData = await db.resetPassword.findUnique({
            where: { userId: sessionCookie.userId }
        })

        if (!sessionData) {
            console.log("Session not found")
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }

        // Compare otp session and otp token
        const isValid = await compare(sessionCookie.token, sessionData.token)

        if (!isValid) {
            console.log("Invalid session")
            return NextResponse.json({ error: "Invalid session" }, { status: 401 })
        }

        const user = await db.user.findUnique({
            where: { id: sessionData.userId }
        })

        // Check if the user exists
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Delete the existing res
        await deleteSession({ userId: user.id, cookieNames: ['resetPassword'], request})
        const newSession = await manageSession({ userId: user.id, sessionType: 'resetPassword'})

        if (!newSession) {
            return NextResponse.json({error: "Reset session not created"}, {status:500})
        }


        await sendEmail({
            to: user.email,
            type: "resetPassword",
            session: newSession.token,
        });
    
        return NextResponse.json({success: "Success in reset Password"}, {status:200})
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}