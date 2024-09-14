import { NextResponse, NextRequest } from "next/server";
import db from "@/lib/db";
import * as z from "zod";

// Define a schema for input Validation
const tempCUIDSchema = z
  .object({
    tempCUID: z.string().min(1, 'tempCUID is required'),
})

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const tempCUID = searchParams.get('tempCUID');

        // parse with schema
        const { tempCUID: parsedTempCUID } = tempCUIDSchema.parse({ tempCUID });

        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: {tempCUID:parsedTempCUID}
        })
        if (!existingUser) {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
        }
        // Check if the email was already verified
        if (existingUser.emailVerified) {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
        }
        // Check that the tempCUID has not expired
        const now = new Date();
        // Check if the token has expired has been alive for more than 15 minutes
        if (now.getTime() - existingUser.tempCUIDTime!.getTime() > 15 * 60 * 1000) {
            return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/404`)
        }

        // Set the email as verified
        await db.user.update({
            where: {tempCUID:parsedTempCUID},
            data: {
                emailVerified: true
            }
        })

        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/verified-email`)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}