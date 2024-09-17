'use server';

import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";
import { hash } from "bcrypt";
import * as z from "zod";
import { createSession } from "@/lib/session";
import { sendVerificationEmail } from "@/app/utils/mail";
import { IP } from "@/app/utils/ip";

// Define a schema for input Validation
const userSchema = z
  .object({
    username: z.string().min(1, 'Username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must have than 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm Password is required').min(8, 'Password must have than 8 characters'),
})


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, username, password, confirmPassword } = userSchema.parse(body);

        // normalize the email 
        const normalizedEmail = email.toLowerCase();
        // normalize the username
        const normalizedUsername = username.toLowerCase();

        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return NextResponse.json({error:"Passwords don't match"}, {status:400})
        }

        // Check if email already exists
        const existingUser = await db.user.findUnique({
            where: {email:normalizedEmail}
        })
        if (existingUser) {
            return NextResponse.json({error:"User with this email already exists"}, {status:409})
        }

        // Check if username already exists
        const existingUsername = await db.user.findUnique({
            where: {username:normalizedUsername}
        })
        if (existingUsername) {
            return NextResponse.json({error:"User with this username already exists"}, {status:409})
        }

        const hashedPassword = await hash(password, 10);
        const ipAddress = IP();
        const recordCreationTime = new Date();
        const user = await db.user.create({
            data: {
                email: normalizedEmail,
                username: normalizedUsername,
                password: hashedPassword,
                ipAddress: ipAddress,
                updatedAt: recordCreationTime,
                createdAt: recordCreationTime,
            }
        })

        const session = await createSession(user.id);
        await sendVerificationEmail({
            to: normalizedEmail, 
            session: session,
        });
        return NextResponse.json({success: "user Created"}, {status:200})

    } catch (error) {
        return NextResponse.json({error:"Something Went Wrong"}, {status:500})
    }
}