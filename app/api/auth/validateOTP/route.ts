'use server';

import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";
import * as z from "zod";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/encrypt";
import { compare } from "bcrypt";
// Define a sc hema for input Validation
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
        const otpSession = cookies().get('otp');
        if (!otpSession) {
            return NextResponse.json({error: "Session not found"}, {status:404})
        }
        const otpSessionCookie = await decrypt(otpSession.value);

        const otpSessionData = await db.oTP.findUnique({
            where: {userId: otpSessionCookie.userId}
        })
        if (!otpSessionData) {
            return NextResponse.json({error: "Session not found"}, {status:404})
        }

        // Compare tokens
        const isValidToken = await compare(otpSessionCookie.token, otpSessionData.token);
        if (!isValidToken) {
            return NextResponse.json({error: "Invalid session"}, {status:401})
        }

        const isValidOTP = await compare(otp, otpSessionCookie.otp);
        if (!isValidOTP) {
            return NextResponse.json({error: "OTP is invalid"}, {status:404})
        }
        
        // Get the session and mark it as mfaVerified
        const baseSession = cookies().get('session');
        if (!baseSession) {
            return NextResponse.json({error: "Session not found"}, {status:404})
        }

        const baseSessionCookie = await decrypt(baseSession.value);
        if (!baseSessionCookie) {
            return NextResponse.json({error: "Session not found"}, {status:404})
        }

        const baseSessionData = await db.session.findMany({
            where: {userId: otpSessionData.userId }
        })

        // For each session info, find the one that bcrypt compares to the token
        let isValid = false;
        let index = 0;
        for (let i = 0; i < baseSessionData.length; i++) {
            isValid = await compare(baseSessionCookie.token, baseSessionData[i].token);
            if (isValid) {
                index = i;
                break;
            }
        }
        if (!isValid) {
            return NextResponse.json({error: "Invalid session"}, {status:401})
        }

        // Mark the session as mfaVerified
        await db.session.update({
            where: { id: baseSessionData[index].id },
            data: { mfaVerified: true }
        })

        // Delete the OTP session
        await db.oTP.delete({
            where: { userId: otpSessionData.userId }
        })

        return NextResponse.json({success: "OTP is valid"}, {status:200})
        } catch (error) {
            return NextResponse.json({error: "Something went wrong"}, { status: 500 })
        }
    }