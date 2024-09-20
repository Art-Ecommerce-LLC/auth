import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/session";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/encrypt";

export async function POST() {
    // Delete session cook
    try {
        const session = cookies().get('session');
        if (!session) {
            throw new Error("Session not found");
        }
        // Decrypt the session
        const decryptedSession = await decrypt(session.value);

        // Delete the session
        await deleteSession(decryptedSession.sessionId);

        return NextResponse.json({ success: "Session deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}