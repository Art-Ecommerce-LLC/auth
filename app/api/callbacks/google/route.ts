// app/api/callbacks/google/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import db from '@/lib/db'

// Load environment variables
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL!;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 });
  }

  try {
    // Exchange the authorization code for an access token
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;

    // Get user info (email, etc.) from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email) {
      return NextResponse.json({ error: 'Failed to retrieve user info' }, { status: 500 });
    }
    // store the user's info in the database

    await db.user.update({
      where: { email: userInfo.email },
      data: {
        accessToken,
        refreshToken,
      },
    });

    return NextResponse.redirect(`${NEXTAUTH_URL}/dashboard`);
  } catch (error) {
    console.error('Error exchanging authorization code for tokens:', error);
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
  }
}
