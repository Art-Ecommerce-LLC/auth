import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcrypt";
import * as z from "zod";
import { headers } from 'next/headers';
import { createId } from '@paralleldrive/cuid2';

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
export async function POST(req: NextRequest, res: NextResponse) {
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
        const isPasswordValid = await bcrypt.compare(password, existingUser.password!);
        if (!isPasswordValid) {
            return NextResponse.json({error:"Email or Username are incorrect"}, {status:401})
        }

        // Check if the email was already verified
        if (!existingUser.emailVerified) {
            // Submit a resend email verification request
            const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/resendEmailVerification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({tempCUID:existingUser.tempCUID}),
            })
            const responseData = await response.json()
            if (responseData.error) {
                return NextResponse.json({error:"Something went wrong in email verification sending"}, {status:401})
            }
            return NextResponse.json({tempCUID:responseData.tempCUID}, {status:401})
        }

        // Check if the user is mfaVerified
        if (!existingUser.mfaVerified) {
            // Create a new tempCUID and send it back to the user for redirection to the mfa page

            // Save the session token in the database
            await db.session.create({
                data: {
                    sessionToken: newSessionToken,
                    sessionTokenTime: newSessionTokenTime,
                    userId: existingUser.id,
                },       
            });
            const res = NextResponse.json({ success: "User logged in" }, { status: 200 });
            const isProduction = process.env.NODE_ENV === 'production';

            // Add the cookie with secure flags
            res.cookies.set('sessionToken', newSessionToken, {
                httpOnly: true,    
                secure: isProduction,    
                sameSite: 'strict', 
                path: '/',      
                maxAge: 60 * 60 * 24 * 15, // 15 day expiry (in seconds) — adjust based on your needs
            });

            return res
        }

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}