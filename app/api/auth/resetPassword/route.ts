'use server';

import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";
import * as z from "zod";
import { sendResetPasswordEmail } from "@/app/utils/mail";
import { createResetPasswordSession } from "@/lib/session";
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
        // normalize the email
        const normalizedEmail = email.toLowerCase();
        const user = await db.user.findUnique({
            where: { email: normalizedEmail }
        })

        if (!user) {
            return NextResponse.json({error: "User not found"}, {status:404})
        }

        // Delete any existing user sessions
        await deleteSession(user.id);

        // Create a ResetPassword session
        const newSession = await createResetPasswordSession(user.id);
        // Send the email
        await sendResetPasswordEmail({
            to: user.email!,
            session: newSession
        });

        return NextResponse.json({success: "Email sent"}, {status:200})

    } catch (error) {
        return NextResponse.json({error: "Internal Server Error"}, {status:500})
    }
}