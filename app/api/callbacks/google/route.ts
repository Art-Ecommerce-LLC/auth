// app/api/callbacks/google/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import db from '@/app/lib/db'
import{ encrypt } from '@/app/lib/encrypt' 
import { oauth2Client } from '@/app/lib/oauth_client';


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
    if (!accessToken || !refreshToken) {
      return NextResponse.json({ error: 'Failed to retrieve tokens' }, { status: 500 });
    }
    // store the encrypted user's info in the database
    // Encrypt thhe user's access token and refresh token before storing them in the database
    const encryptedGoogleTokens = await encrypt({accessToken, refreshToken});

    await db.user.update({
      where: { email: userInfo.email },
      data: {
        googleToken: encryptedGoogleTokens,
      },
    });

    return NextResponse.redirect(`${process.env.NODE_URL}/dashboard`);
  } catch (error) {
    console.error('Error exchanging authorization code for tokens:', error);
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
  }
}
