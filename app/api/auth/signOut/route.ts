import { NextResponse, NextRequest } from "next/server";
import { deleteSession } from "@/lib/session";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/encrypt";
import db from "@/lib/db";

export async function POST(request: NextRequest) {
    // Delete session cook
    try {
        const session = (await cookies()).get('session');
        if (!session) {
            throw new Error("Session not found");
        }
        // Decrypt the session
        const decryptedSession = await decrypt(session.value);

        // get the session data
        const sessionData = await db.session.findMany({
            where: { userId: decryptedSession.userId }
        });
        
        // Check if the session exists
        if (!sessionData) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }
        // Delete all sessions
        await deleteSession({ userId: decryptedSession.userId, cookieNames: ['session'], request, deleteAllSessions: true });


        return NextResponse.json({ success: "Session deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}