'use server';

import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";
import * as z from "zod";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/encrypt";
import { compare } from "bcrypt";
import { manageSession, deleteSession } from "@/lib/session";

// Define a sc hema for input Validation
const userSchema = z
  .object({
    // only allowed is 6 length string
    otp: z.string().length(6, 'OTP must be 6 characters'),
})


// POST /api/auth/validateLogin
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { otp } = userSchema.parse(body);

        // Validate the OTP against the session and then the OTP table
        const otpSession = (await cookies()).get('otp');
        

        if (!otpSession) {
            return NextResponse.json({error:"Session not found"}, {status:404})
        }

        // Decrypt the session and validate it

        const sessionCookie = await decrypt(otpSession.value);
        
        const sessionData = await db.oTP.findUnique({
            where: { userId: sessionCookie.userId }
        })

        if (!sessionData) {
            return NextResponse.json({error:"Session not found"}, {status:404})
        }

        // Compare otp session and otp token
        const isValid = await compare(otp, sessionData.otp)
        const isValidToken = await compare(sessionCookie.token, sessionData.token)
        if (!isValid || !isValidToken) {
            return NextResponse.json({error:"Invalid OTP or Token"}, {status:401})
        }

        // Delete the existing otp session

        // Get the session Data Cookie
        const sessionDataCookie = (await cookies()).get('session')

        if (!sessionDataCookie) {
            return NextResponse.json({error: "No Session"}, {status: 200})
        }

        const decryptedSessionCookie = await decrypt(sessionDataCookie.value)
        // Extract sessionDataCookie and validate it

        const sessionDB = await db.session.findUnique({
            where : {id: decryptedSessionCookie.sessionId}
        })

        if (!sessionDB) {
            return NextResponse.json({error: "No Session"}, {status: 200})
        }

        const isValidSessionToken = await compare(decryptedSessionCookie.token, sessionDB.token)

        if (!isValidSessionToken) {
            return NextResponse.json({error: "No Valid Session Token"}, {status: 200})
        }
        // Create a new base session with mfa verified
        await manageSession({
            userId: sessionCookie.userId,
            sessionType: 'session',
            mfaVerified: true,
            sessionId: sessionCookie.sessionId,
        })
        await deleteSession({userId: sessionCookie.userId, cookieNames: ['otp'], request})
        

        return NextResponse.json({success:"OTP validated successfully"}, {status:200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({error: "Something went wrong"}, {status:500})
    }
}