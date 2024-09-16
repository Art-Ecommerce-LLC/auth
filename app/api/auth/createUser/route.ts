import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";
import { hash } from "bcrypt";
import * as z from "zod";
import { headers } from 'next/headers';
import nodemailer from 'nodemailer';
import { createSession } from "@/lib/session";

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

const IP = (): string => {
    const FALLBACK_IP_ADDRESS = '0.0.0.0';
    const forwardedFor = headers().get('x-forwarded-for');
    
    if (forwardedFor) {
      return forwardedFor.split(',')[0] ?? FALLBACK_IP_ADDRESS;
    }
    
    return headers().get('x-real-ip') ?? FALLBACK_IP_ADDRESS;
  };

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

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
            });
        // create session token
        const session = await createSession(user.id);

        // send email verification with the encrypted session token
        const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verifyEmail?session=${session}`;

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: normalizedEmail,
            subject: 'Email Verification',
            text: `Please verify your email by clicking this link: ${verificationUrl}`,
            html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
            });


        return NextResponse.json({success: "user Created"}, {status:200})

    } catch (error) {
        return NextResponse.json({error:"Something Went Wrong"}, {status:500})
    }
}