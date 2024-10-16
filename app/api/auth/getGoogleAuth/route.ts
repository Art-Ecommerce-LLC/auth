import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/encrypt";
import db from "@/app/lib/db";
import { oauth2Client } from "@/app/lib/oauth_client";

export async function GET() {

    try {
        const session = cookies().get('session');
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        // Decrypt the session cookie
        const decryptedSession = await decrypt(session.value);
        
        // Find the user in the database
        const user = await db.user.findUnique({
            where: { id: decryptedSession.userId },
        });
    
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        
        if (!user.googleToken) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Decrypt the user's google tokens
        const decryptedGoogleTokens = await decrypt(user.googleToken);
    
        oauth2Client.setCredentials({
            access_token: decryptedGoogleTokens.accessToken,
            refresh_token: decryptedGoogleTokens.refreshToken,
        });

        return NextResponse.json({ message: 'Authorized' });
    } catch (error) {
        return NextResponse.json({ error: "Unauthroized"} , { status: 500 });
    }

}