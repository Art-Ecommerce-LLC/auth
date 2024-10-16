
import { NextResponse } from 'next/server';
import { oauth2Client } from '@/app/lib/oauth_client';

export async function GET() {
  // Include the Google Calendar scopes along with the user profile scopes
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.events.readonly',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.settings.readonly',
  ];

  // Generate the Google OAuth URL with the additional calendar scopes
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });

  // Redirect the user to the Google OAuth login page
  return NextResponse.redirect(authUrl);
}
