"use server";

import nodemailer from 'nodemailer';

export async function sendMail({ to, subject, text, html } : { to: string, subject: string, text: string, html: string }) {
    try{
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
            });
            
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: to,
            subject: subject,
            text: text,
            html: html,
            });
    } catch (error) {
            console.log(error)
            return {error: "Something went wrong"};
        }

}
export async function sendVerificationEmail({ to, session } : { to: string, session: string }) {
    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verifyEmail?session=${session}`;
    const subject = 'Email Verification';
    const text = `Please verify your email by clicking this link: ${verificationUrl}`;
    const html = `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`;
    return sendMail({ to, subject, text, html });
}

export async function sendOTPEmail({ to, otp } : { to: string, otp: string }) {
    const subject = 'OTP Verification';
    const text = `Please verify your OTP`;
    const html = `<p>Your OTP is: ${otp}</p>`;
    return sendMail({ to, subject, text, html });
}

  