'use server';

import { NextResponse, NextRequest } from "next/server";
import db from "@/app/lib/db";
import * as z from "zod";
import { manageSession } from "@/app/lib/session";
import { sendEmail } from "@/app/utils/mail";

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

        // Create a new session
        const session = await manageSession({
            userId: user.id,
            sessionType: 'resetPassword',
            storeSession: false,
        });
        // Send the email
        await sendEmail({
            to: user.email,
            type: "resetPassword",
            session: session.token,
        });

        return NextResponse.json({success: "Email sent"}, {status:200})

    } catch (error) {
        console.log(error)
        return NextResponse.json({error: "Internal Server Error"}, {status:500})
    }
}