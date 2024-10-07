import { NextResponse, NextRequest} from 'next/server';
import prisma from '@/lib/db';
// zod schema
import { z } from 'zod';
import { getSession } from '@/lib/dal';
import { decrypt } from '@/lib/encrypt';
import { google } from 'googleapis';

const schema = z.object({
  title: z.string(),
  description: z.string(),
  dateTime: z.string(),
  timezone: z.string(),
});
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const timezoneMap : Record<string, string> = {
  'ET': 'America/New_York',
  'CT': 'America/Chicago',
  'MT': 'America/Denver',
  'PT': 'America/Los_Angeles',
  'AKT': 'America/Anchorage',
  'HAT': 'Pacific/Honolulu',
};

export async function POST(request: NextRequest) {
  try {
  const body = await request.json(); 
  const { title, description, dateTime, timezone } = schema.parse(body);
  const eventDate = new Date(dateTime);
  
  if (eventDate < new Date()) {
    throw new Error('Event date must be in the future');
  }

  // Store the event in the database
  await prisma.event.create({
    data: {
      title,
      description,
      date: eventDate,
    },
  });

 // Get session and query the googletokens to access the google calendar
  const session = await getSession();
  const userId = session?.session?.userId;
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { googleToken: true },
  });

  // Decrypt the user's access and refresh tokens
  const decryptedGoogleTokens = await decrypt(user?.googleToken!);

  oauth2Client.setCredentials({
    access_token: decryptedGoogleTokens.accessToken,
    refresh_token: decryptedGoogleTokens.refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // Create an event in the user's Google Calendar
  const eventRequest = {
    calendarId: 'primary',
    resource: {
      summary: title,
      description,
      start: {
        dateTime: eventDate.toISOString(),
        timeZone: timezoneMap[timezone],
      },
      end: {
        dateTime: eventDate.toISOString(),
        timeZone: timezoneMap[timezone],
      },
    },
  };

  await calendar.events.insert(eventRequest);

  return NextResponse.json({ message: 'Event created' }, { status: 201 });
 
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Error creating event' }, { status: 500 });
  }
}
