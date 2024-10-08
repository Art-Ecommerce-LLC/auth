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
});
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);


export async function POST(request: NextRequest) {
  try {
  const body = await request.json(); 
  const { title, description, dateTime } = schema.parse(body);
  
  const date = new Date(dateTime);

  if (!date) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  }

  if (date < new Date()) {
    return NextResponse.json({ error: 'Date must be in the future' }, { status: 400 });
  }

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
      date,
      serviceToken: user.serviceToken,
    },
  });

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

  const eventRequest = {
    calendarId: '055f86c75a99c3985ff91566fe3705198573df32246426b79c8636e6af4b657a@group.calendar.google.com',
    resource: {
      summary: title,
      description,
      start: {
        dateTime: date,
      },
      end: {
        dateTime: date,
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
    where: { date },
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
