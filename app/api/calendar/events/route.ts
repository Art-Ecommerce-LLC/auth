// app/api/calendar/events/route.ts
import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/dal';
import { decrypt } from '@/lib/encrypt';
import db from '@/lib/db';
// Load environment variables
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export async function GET() {
  // For simplicity, tokens are hard-coded here, but in production, you should retrieve them from a secure database.
    const session = await getSession();
    const userId = session?.session?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Use user ID to retrieve access and refresh tokens from the database
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { googleToken: true },
    });

    if (!user?.googleToken) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Decrypt the user's access and refresh tokens
    const decryptedGoogleTokens = await decrypt(user.googleToken);


  oauth2Client.setCredentials({
    access_token: decryptedGoogleTokens.accessToken,
    refresh_token: decryptedGoogleTokens.refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {

    // fetch the differnet calendars and log their Ids so we can use them later

    const res = await calendar.events.list({
      calendarId: "055f86c75a99c3985ff91566fe3705198573df32246426b79c8636e6af4b657a@group.calendar.google.com",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = res.data.items;

    console.log(events);
    if (!events || events.length === 0) {
      return NextResponse.json({ message: 'No upcoming events found.' });
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'Failed to retrieve events' }, { status: 500 });
  }
}
