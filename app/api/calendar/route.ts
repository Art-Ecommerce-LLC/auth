// app/api/calendar/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

// Load environment variables
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Define the scope (read-only access to Google Calendar)
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

// Generate the URL for Google OAuth2 authorization
export async function GET() {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  // Redirect the user to Google's OAuth 2.0 consent screen
  return NextResponse.redirect(authUrl);
}
