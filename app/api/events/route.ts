import { NextResponse, NextRequest} from 'next/server';
import db from '@/lib/db';
// zod schema
import { z } from 'zod';
import { getSession } from '@/lib/dal';
import { decrypt } from '@/lib/encrypt';
import { google } from 'googleapis';
import { DateTime } from 'luxon';

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
  'et': 'America/New_York',
  'ct': 'America/Chicago',
  'mt': 'America/Denver',
  'pt': 'America/Los_Angeles',
  'akt': 'America/Anchorage',
  'hat': 'Pacific/Honolulu',
};

export async function POST(request: NextRequest) {
  try {
  const body = await request.json(); 
  const { title, description, dateTime, timezone } = schema.parse(body);
  // Get the correct timezone from the map
  const selectedTimezone = timezoneMap[timezone.toLowerCase()];
  if (!selectedTimezone) {
    return NextResponse.json({ error: 'Invalid timezone' }, { status: 400 });
  }

  const date = new Date(dateTime);
  const isoString = DateTime.fromJSDate(date).toISO({ includeOffset: true, suppressMilliseconds: true });

  if (!isoString) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  const eventDate = DateTime.fromISO(isoString);
  if (eventDate < DateTime.now()) {
    return NextResponse.json({ error: 'Event date must be in the future' }, { status: 400 });
  }


  console.log('isoString', isoString);


  const session = await getSession();
  const userId = session?.session?.userId;
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { googleToken: true, serviceToken: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Store the event in the database
  await db.event.create({
    data: {
      title,
      description,
      date: eventDate.toJSDate(),
      serviceToken: user.serviceToken,
    },
  });

 // Get session and query the googletokens to access the google calendar




  // Decrypt the user's access and refresh tokens
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (!user.googleToken) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const decryptedGoogleTokens = await decrypt(user.googleToken);

  oauth2Client.setCredentials({
    access_token: decryptedGoogleTokens.accessToken,
    refresh_token: decryptedGoogleTokens.refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // Create an event in the user's Google Calendar
  console.log('timezone', timezone);
  console.log('timezoneMap', timezoneMap[timezone]);
  console.log('isoString', isoString);
  const eventRequest = {
    calendarId: '055f86c75a99c3985ff91566fe3705198573df32246426b79c8636e6af4b657a@group.calendar.google.com',
    resource: {
      summary: title,
      description,
      start: {
        dateTime: isoString,
        // timeZone: timezoneMap[timezone],
      },
      end: {
        // Add 30 minutes to the start date for the end time
        dateTime: eventDate.plus({ minutes: 30 }).toISO(),
        // timeZone: timezoneMap[timezone],
      },
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`, // Unique ID for the request
          conferenceSolutionKey: {
            type: 'hangoutsMeet', // This specifies that it's a Google Meet event
          },
        },
      },
    },
    conferenceDataVersion: 1, // Enable conference data for Google Meet
  };
  const newGoogleEvent = await calendar.events.insert(eventRequest);
  // Store the Google Event ID in the database
  await db.event.update({
    where: { date: eventDate.toJSDate() },
    data: {
      googleEventId: newGoogleEvent.data.id
    },
  });

  return NextResponse.json({ message: 'Event created' }, { status: 201 });
 
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Error creating event' }, { status: 500 });
  }
}
