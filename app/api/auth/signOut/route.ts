import { NextResponse, NextRequest } from "next/server";
import { deleteSession } from "@/app/lib/session";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/encrypt";
import db from "@/app/lib/db";

export async function POST(request: NextRequest) {
    // Delete session cook
    try {
        const session = cookies().get('session');
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