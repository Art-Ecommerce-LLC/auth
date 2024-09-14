import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {

    // grab htt

    // grab sessionToken from the cookies
    const sessionToken = cookies()
    console.log(sessionToken)

  return NextResponse.json({ message: "Hello World" });
}