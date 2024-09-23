
import { NextResponse } from "next/server";
import { manageSession } from "@/lib/session";

export async function GET() {

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/verify-email`)
}