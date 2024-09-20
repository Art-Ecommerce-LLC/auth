'server only';

import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcrypt";
import * as z from "zod";
import { cookies } from "next/headers";
import { createOTPSession, createVerifyEmailSession, deleteSession } from "@/lib/session";
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
        
        // Check if the session is encrypted
        if (!existingUser.emailVerified) {

            // Create a new session
            const session = await createVerifyEmailSession(existingUser.id);
            const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/resendEmailVerification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Set-Cookie': `session=${session}`
                },
            })
            const responseData = await response.json()
            console.log('responseData', responseData)
            if (responseData.error) {
                return NextResponse.json({error:"Something went wrong in email verification sending"}, {status:500})
            }
            // Return a unauthorized response
            return NextResponse.json({error:"Email not verified"}, {status:401})

        }

        const encryptedSession = cookies().get('session');

        if (!encryptedSession) {
            const session = await createVerifyEmailSession(existingUser.id);
            const newSessionDecrypt = await decrypt(session);

            const newOTP = await createOTPSession(newSessionDecrypt.sessionId);

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
            const session = await createVerifyEmailSession(existingUser.id);
            // Decrypt the session
            const newSessionDecrypt = await decrypt(session);

            const newOTP = await createOTPSession(newSessionDecrypt.sessionId);

            // Send an email to the user with the new OTP
            await sendOTPEmail({
                to: normalizedEmail,
                otp: newOTP
            });

            return NextResponse.json({error:"OTP not verified"}, {status:402})
        } else if (!sessionData.mfaVerified) {
            // if the session isn't verified send a new OTP
            const newOTP = await createOTPSession(sessionData.sessionId);

            // Send an email to the user with the new OTP
            await sendOTPEmail({
                to: normalizedEmail,
                otp: newOTP
            });

            return NextResponse.json({error:"OTP not verified"}, {status:402})
        } else if (sessionData.mfaVerified) {
            // if the session is verified return a success response
            return NextResponse.json({success:"OTP verified"}, {status:200})
        }
        } catch (error) {
            console.log('error', error)
            return NextResponse.json({error: "Something went wrong"}, { status: 500 })
        }
    }