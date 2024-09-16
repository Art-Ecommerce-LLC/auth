import { NextResponse } from "next/server";
import db from "@/lib/db";
import nodemailer from 'nodemailer';
import { decrypt } from "@/lib/encrypt";
import { deleteSession, createSession } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const body = cookies();
        // Grab the session from the cookies
        const session = body.get('session');

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }
        const decryptedSession = await decrypt(session.value);

        const sessionData = await db.session.findUnique({
            where: { id: decryptedSession.sessionId }
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
        await deleteSession(sessionData.id);
        const newSession = await createSession(user.id);
        
        // resend email verification
        const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verifyEmail?session=${newSession}`;
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
            });
;
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: user.email!,
            subject: 'Email Verification',
            text: `Please verify your email by clicking this link: ${verificationUrl}`,
            html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
            });

        return NextResponse.json({success: "success "}, {status:200})
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}