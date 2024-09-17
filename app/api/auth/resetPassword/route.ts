'use server';

import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";
import * as z from "zod";
import { cookies } from "next/headers";
import { sendResetPasswordEmail } from "@/app/utils/mail";
import { createSession } from "@/lib/session";
import { decrypt } from "@/lib/encrypt";
import { deleteSession } from "@/lib/session";

// Define a schema for input Validation
const userSchema = z
  .object({
    // only allowed is 6 length string
    email: z.string().email('Invalid email'),
})


// POST /api/auth/resetPassword
export async function POST(req : NextRequest) {
    try {
        const body = await req.json();
        const { email } = userSchema.parse(body);

        // Check if the user exists
        const user = await db.user.findUnique({
            where: { email }
        })

        if (!user) {
            return NextResponse.json({error: "User not found"}, {status:404})
        }

        // Check if the user has a session 
        const session = cookies().get('session');
        if (!session) {
            // Create a new session
            const newSession = await createSession(user.id);
            
            // Send the email
            await sendResetPasswordEmail({
                to: user.email!,
                session: newSession
            });

            return NextResponse.json({success: "Email sent"}, {status:200})
        }

        // Decrypt the session
        const decryptedSession = await decrypt(session.value);
        // Check if the session isn't expired
        if (decryptedSession.expiresAt < new Date()) {
            // Create a new session
            // Delete the old session

            await deleteSession(decryptedSession.sessionId);

            const newSession = await createSession(user.id);
            
            // Send the email
            await sendResetPasswordEmail({
                to: user.email!,
                session: newSession
            });

            return NextResponse.json({success: "Email sent"}, {status:200})
        }

        // Send the email
        await sendResetPasswordEmail({
            to: user.email!,
            session: session.value
        });

        return NextResponse.json({success: "Email sent"}, {status:200})
    } catch (error) {
        console.log('error', error) 
    }
}