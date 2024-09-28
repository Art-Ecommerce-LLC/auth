'server only';

import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcrypt";
import * as z from "zod";
import { manageSession } from "@/lib/session";
import { sendEmail } from "@/app/utils/mail";
// Define a schema for input Validation
const userSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must have than 8 characters'),
})


// POST /api/auth/validateLogin
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = userSchema.parse(body);

        // normalize the email 
        const normalizedEmail = email.toLowerCase();

        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: {email:normalizedEmail}
        })
        if (!existingUser) {
            return NextResponse.json({error:"Email or Username are incorrect"}, {status:404})
        }

        // Check if password matches
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordValid) {
            return NextResponse.json({error:"Email or Username are incorrect"}, {status:404})
        }
        
        // Check if email is verified
        if (!existingUser.emailVerified) {
            const session = await manageSession({
                userId: existingUser.id,
                sessionType: 'verifyEmail'
            })
            sendEmail({ 
                to: existingUser.email,
                type: "verifyEmail",
                session: session.token,
            });
            return NextResponse.json({error: "Email not verified"}, {status: 401})
        }

        // Create a new session that isn't mfa verified
        await manageSession({
            userId: existingUser.id,
            sessionType: 'session'
        })

        const otpSession = await manageSession({
            userId: existingUser.id,
            sessionType: 'otp'
        });

        // Send the email

        if (!otpSession) {
            return NextResponse.json({error: "OTP session not created"}, {status:500})
        }

        if (!('otp' in otpSession)) {
            return NextResponse.json({error: "OTP not found in session data"}, {status:500})
        }

        await sendEmail({
            to: existingUser.email,
            type: "otp",
            session: otpSession.token,
            otp: otpSession.otp,
        });

        return NextResponse.json({success: "Login successful"}, {status:200})

        } catch (error) {
            console.log(error)
            return NextResponse.json({error: "Something went wrong"}, { status: 500 })
        }
    }