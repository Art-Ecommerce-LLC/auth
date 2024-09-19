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
    username: z.string().min(3).max(50),
    email: z.string().email({ message: "Invalid email address" }).min(5).max(50),
    password: z.string().min(8).max(50).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,}$/, {
        message: "Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character"
    }),
    confirmPassword: z.string().min(8).max(50),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // This will set the error on the confirmPassword field
  });


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, username, password } = userSchema.parse(body);

        // normalize the email 
        const normalizedEmail = email.toLowerCase();
        // normalize the username
        const normalizedUsername = username.toLowerCase();

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
        const user = await db.user.create({
            data: {
                email: normalizedEmail,
                username: normalizedUsername,
                password: hashedPassword,
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