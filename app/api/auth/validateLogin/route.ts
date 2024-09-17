'use server';
import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcrypt";
import * as z from "zod";
import { cookies } from "next/headers";
import { createOTPSession, createSession, deleteSession } from "@/lib/session";
import { decrypt } from "@/lib/encrypt";
import { sendOTPEmail } from "@/app/utils/mail";
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
        const isPasswordValid = await bcrypt.compare(password, existingUser.password!);
        if (!isPasswordValid) {
            return NextResponse.json({error:"Email or Username are incorrect"}, {status:404})
        }

        // Check if the email was already verified
        if (!existingUser.emailVerified) {
            // Submit a resend email verification request
            // Check if their is already a session associated with the user
            const encryptedSession = cookies().get('session');
            
            if (!encryptedSession) {
                // Create a new session for the user
                await createSession(existingUser.id);
            }

            // Send the email verification
            const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/resendEmailVerification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const responseData = await response.json()
            if (responseData.error) {
                return NextResponse.json({error:"Something went wrong in email verification sending"}, {status:500})
            }
            // Return a unauthorized response
            return NextResponse.json({error:"Email not verified"}, {status:401})
        }

        // Check if their is already a session associated with the user
        const encryptedSession = cookies().get('session');
        if (!encryptedSession) {
            // if their isn't create a new session for the user
            const encryptedSessionData = await createSession(existingUser.id);
            // Decrypt the session
            const decSession = await decrypt(encryptedSessionData);


            // since default session is not MFAverified, we will return unauthorized code for not OTP verified
            const newOTP = await createOTPSession(decSession.sessionId);

            // Send an email to the user with the new OTP
            await sendOTPEmail({
                to: normalizedEmail,
                otp: newOTP
            });
            return NextResponse.json({error:"OTP not verified"}, {status:402})
        }

        // check if the encrypted session is OTP verified
        const decryptedSession = await decrypt(encryptedSession.value);
        const sessionData = await db.session.findUnique({
            where: { sessionId: decryptedSession.sessionId }
        })
        if (!sessionData) {
            // if their isn't a database session for the cookie delete the old cookie and create a new session
            await deleteSession(decryptedSession.sessionId);
            const session = await createSession(existingUser.id);
            // Decrypt the session
            const newSessionDecrypt = await decrypt(session);
            const sessionData = await db.session.findUnique({
                where: { sessionId: newSessionDecrypt.sessionId }
            })
            if (!sessionData) {
                return NextResponse.json({error:"Eror creating new session"}, {status:500})
            }

            const newOTP = await createOTPSession(sessionData.sessionId);

            // Send an email to the user with the new OTP
            await sendOTPEmail({
                to: normalizedEmail,
                otp: newOTP
            });

            return NextResponse.json({error:"OTP not verified"}, {status:402})
        }
        // Now we can return a success response if the user is verified
        if (sessionData.mfaVerified) {
            return NextResponse.json({success:"success"}, {status:200})
        } else {
            const newOTP = await createOTPSession(sessionData.sessionId);

            // Send an email to the user with the new OTP
            await sendOTPEmail({
                to: normalizedEmail,
                otp: newOTP
            });
            return NextResponse.json({error:"OTP not verified"}, {status:402})
        }
        } catch (error) {
            return NextResponse.json({error: "Something went wrong"}, { status: 500 })
        }
    }