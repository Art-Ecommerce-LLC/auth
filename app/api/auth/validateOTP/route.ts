import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcrypt";
import * as z from "zod";
import { cookies } from "next/headers";
import { createOTPSession, createSession, deleteSession } from "@/lib/session";
import { decrypt } from "@/lib/encrypt";
import nodemailer from 'nodemailer';
// Define a schema for input Validation
const userSchema = z
  .object({
    // only allowed is 6 length string
    otp: z.string().length(6, 'OTP must be 6 characters'),
})


// POST /api/auth/validateLogin
export async function POST(req: NextRequest, res: NextResponse) {
    try {
        const body = await req.json();
        const { otp } = userSchema.parse(body);
        console.log({otp})
        } catch (error) {
            return NextResponse.json({error: "Something went wrong"}, { status: 500 })
        }
    }