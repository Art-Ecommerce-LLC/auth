"use server";

import nodemailer from 'nodemailer';

// Core function to send an email
export async function sendMail({ to, subject, text, html }: { to: string, subject: string, text: string, html: string }) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject,
            text,
            html,
        });
    } catch (error) {
        console.log(error);
        return { error: "Something went wrong" };
    }
}

// Generalized function to send various types of emails
export async function sendEmail({
    to,
    type,
    session = '',
    otp = '',
}: {
    to: string;
    type: 'verifyEmail' | 'otp' | 'resetPassword';
    session?: string;
    otp?: string;
}) {
    let subject = '';
    let text = '';
    let html = '';

    switch (type) {
        case 'verifyEmail':
            const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verifyEmail?session=${session}`;
            subject = 'Email Verification';
            text = `Please verify your email by clicking this link: ${verificationUrl}`;
            html = `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`;
            break;

        case 'otp':
            subject = 'OTP Verification';
            text = `Please verify your OTP`;
            html = `<p>Your OTP is: ${otp}</p>`;
            break;

        case 'resetPassword':
            const resetPasswordUrl = `${process.env.NEXTAUTH_URL}/api/auth/verifyPasswordReset?session=${session}`;
            subject = 'Reset Password';
            text = `Click this link to reset your password: ${resetPasswordUrl}`;
            html = `<p>Click <a href="${resetPasswordUrl}">here</a> to reset your password.</p>`;
            break;

        default:
            throw new Error('Invalid email type');
    }

    return sendMail({ to, subject, text, html });
}
