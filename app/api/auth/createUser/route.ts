import { NextResponse } from "next/server";
import db from "@/lib/db";
import { hash } from "bcrypt";
import * as z from "zod";
import { headers } from 'next/headers';
import nodemailer from 'nodemailer';
import { normalize } from "path";

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

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, username, password, confirmPassword } = userSchema.parse(body);

        // normalize the email 
        const normalizedEmail = email.toLowerCase();
        // normalize the username
        const normalizedUsername = username.toLowerCase();

        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return NextResponse.json({message:"Passwords don't match"}, {status:400})
        }

        // Check if email already exists
        const existingUser = await db.user.findUnique({
            where: {email:normalizedEmail}
        })
        if (existingUser) {
            return NextResponse.json({message:"User with this email already exists"}, {status:409})
        }

        // Check if username already exists
        const existingUsername = await db.user.findUnique({
            where: {username:normalizedUsername}
        })
        if (existingUsername) {
            return NextResponse.json({message:"User with this username already exists"}, {status:409})
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
                tempCUIDTime: recordCreationTime
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
        const verificationUrl = `${process.env.NEXTAUTH_URL}/api/verify-email?tempUUID=${encodeURIComponent(user.tempCUID!)}`;
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: normalizedEmail,
            subject: 'Email Verification',
            text: `Please verify your email by clicking this link: ${verificationUrl}`,
            html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
            });


        return NextResponse.json({message:"User Created Successfully"}, {status:200})


        // Normalize email and username to lowercase
        // const normalizedEmail = email.toLowerCase();
        // const normalizedUsername = username.toLowerCase();

        // // Check if email already exists

        // if (existingUserByEmail) {
        //     return NextResponse.json({user:null, message:"User with this email already exists"}, {status:409})
        // }

        // // Check if email already exists
        // const existingUserByUsername = await db.user.findUnique({
        //     where: {username : normalizedUsername}
        // })

        // if (existingUserByUsername) {
        //     return NextResponse.json({user:null, message:"User with this username already exists"}, {status:409})
        // }

        // // Get the user ip address
        // const ipAddress = IP();
        // // Generate a session token (JWT) that includes the userId and email
  
        
        // // Create a new user
        // const hashedPassword = await hash(password, 10);
        // const emailLinkTime = new Date();
        // const newUser = await db.user.create({
        //     data: {
        //         email: normalizedEmail, 
        //         username: normalizedUsername, 
        //         password: hashedPassword,
        //         ipAddress: ipAddress,
        //         updatedAt: new Date(),
        //         createdAt: new Date(),
        //         emailLinkTime: emailLinkTime
        //     }
        // })
        // // Encrypt the userId and email
        // const sensitiveData = JSON.stringify({ userId: newUser.id, email: newUser.email, emailLinkTime: emailLinkTime });
        // const encryptedData = encrypt(sensitiveData);

        // // Send the encrypted data in the verification email link
        // const verificationUrl = `${process.env.NEXTAUTH_URL}/api/verify-email?sessionToken=${encodeURIComponent(encryptedData)}`;

        // const transporter = nodemailer.createTransport({
        //     service: "gmail",
        //     auth: {
        //         user: process.env.SMTP_USER,
        //         pass: process.env.SMTP_PASSWORD
        //     }
        //     });

        // await transporter.sendMail({
        //     from: process.env.SMTP_USER,
        //     to: normalizedEmail,
        //     subject: 'Email Verification',
        //     text: `Please verify your email by clicking this link: ${verificationUrl}`,
        //     html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
        //     });

        return NextResponse.json({message:"User Created Successfully"}, {status:200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({message:"Something Went Wrong"}, {status:500})
    }
}