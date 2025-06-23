import { deleteSession } from "@/lib/session";
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/encrypt";

export async function POST(request: NextRequest) {
    console.log('POST /api/auth/remove-reset-session');
    // Get session data
    const session = (await cookies()).get('resetPassword')?.value;
    if (!session) { 
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Get the session data
    const decryptedSession = await decrypt(session);

    if (!decryptedSession.userId) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Delete the resetPassword session
    await deleteSession({ userId: decryptedSession.userId,request,  cookieNames: ['resetPassword'] });

    return NextResponse.json({ success: "Session deleted" }, { status: 200 });
}