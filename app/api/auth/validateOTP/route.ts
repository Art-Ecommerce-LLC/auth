'use server';

import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";
import * as z from "zod";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/encrypt";
// Define a schema for input Validation
const userSchema = z
  .object({
    // only allowed is 6 length string
    otp: z.string().length(6, 'OTP must be 6 characters'),
})


// POST /api/auth/validateLogin
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { otp } = userSchema.parse(body);

        // Validate the OTP against the session and then the OTP table
        const session = cookies().get('session');
        if (!session) {
            return NextResponse.json({error: "Session not found"}, {status:404})
        }
        const decryptedSession = await decrypt(session.value);

        // Check that the session isn't expired
        if (decryptedSession.expiresAt < new Date()) {
            return NextResponse.json({error: "Session expired"}, {status:404})
        }

        const sessionData = await db.session.findUnique({
            where: { sessionId: decryptedSession.sessionId }
        })
        if (!sessionData) {
            return NextResponse.json({error: "Session not found"}, {status:404})
        }
        // Check that the session isnn't already OTP verified
        if (sessionData.mfaVerified) {
            return NextResponse.json({error: "Session already verified"}, {status:409})
        }
        // Check if the OTP is valid

        const otpData = await db.oTP.findFirst({
            where: {
                sessionId: sessionData.sessionId,
                otp: otp
            }
        })

        if (!otpData) {
            return NextResponse.json({error: "OTP is invalid"}, {status:404})
        }

        // Check the OTP is the same as the database
        if (otpData.otp !== otp) {
            return NextResponse.json({error: "OTP is invalid"}, {status:404})
        }
        
        // Check if the OTP is expired
        if (otpData.expiresAt < new Date()) {
            return NextResponse.json({error: "OTP is expired"}, {status:404})
        }
        // Update the session to be mfaVerified
        await db.session.update({
            where: { sessionId: sessionData.sessionId },
            data: {
                mfaVerified: true
            }
        })
        return NextResponse.json({success: "OTP is valid"}, {status:200})
        } catch (error) {
            return NextResponse.json({error: "Something went wrong"}, { status: 500 })
        }
    }