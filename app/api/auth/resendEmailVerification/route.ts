import { NextResponse } from "next/server";
import db from "@/lib/db";
import * as z from "zod";
import nodemailer from 'nodemailer';
import cuid from 'cuid';

// Define a schema for input Validation
const userSchema = z
  .object({
    tempCUID: z.string().min(1, 'tempCUID is required'),
})

// Function to generate a unique tempCUID
async function generateUniqueTempCUID(): Promise<string> {
    let newTempCUID: string = "";
    let isUnique = false;

    // Loop until we find a unique tempCUID
    while (!isUnique) {
        newTempCUID = cuid(); // Generate a new cuid

        // Check if this cuid is already in the database
        const existingUser = await db.user.findUnique({
            where: { tempCUID: newTempCUID },
        });

        if (!existingUser) {
            isUnique = true; // If no user exists with this cuid, it's unique
        }
    }

    return newTempCUID;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { tempCUID } = userSchema.parse(body);

        // Check if tempCUID exists
        const existingUser = await db.user.findUnique({
            where: {tempCUID}
        })
        if (!existingUser) {
            return NextResponse.json({error:"User not found"}, {status:404})
        }
        // Check if the email was already verified
        if (existingUser.emailVerified) {
            return NextResponse.json({error:"Email already verified"}, {status:409})
        }
        // Assign new tempCUID and new tempCUIDTime, because we want to invalidate the old one
        const newTempCUIDTime = new Date();
        // If it has, update the tempCUID with a new one and update the tempCUIDTime
        const newTempCUID = await generateUniqueTempCUID();
        await db.user.update({
            where: {tempCUID},
            data: {
                tempCUID: newTempCUID,
                tempCUIDTime: newTempCUIDTime,
            }
        })

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
            });

        // send verification url with tempUUID
        const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verifyEmail?tempCUID=${encodeURIComponent(newTempCUID)}`;
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: existingUser.email!,
            subject: 'Email Verification',
            text: `Please verify your email by clicking this link: ${verificationUrl}`,
            html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
            });

        return NextResponse.json({message:"User found"}, {status:200})
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}