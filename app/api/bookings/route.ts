import { NextResponse, NextRequest } from 'next/server';
import db from '@/lib/db';
import { google } from 'googleapis';
import { decrypt } from '@/lib/encrypt';
import { z } from 'zod';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);


const schema = z.object({
  hostEmail: z.string(),
  guestEmail: z.string(),
  bookingId: z.string(),
});


export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json();
    // Validate the request body
    const { hostEmail, guestEmail, bookingId }= schema.parse(body);

    // turn the bookingId into an integer
    const bookingIdInt = parseInt(bookingId);

    // Get the time slot from the database
    const event = await db.event.update({
      where: { id: bookingIdInt },
      data: {
        guestEmail,
        isBooked: true,
      },
    });

    // Get the user's google tokens
    const user = await db.user.findUnique({
      where: { email: hostEmail },
      select: { googleToken: true },
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

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    if (!event.googleEventId) {
      return NextResponse.json({ error: 'Google event ID not found' }, { status: 404 });
    }
    // Add the guest email to the event
    const existingEvent = await calendar.events.get({
      calendarId: 'primary',
      eventId: event.googleEventId,
    });

    const attendees = existingEvent.data.attendees || [];
    attendees.push({ email: guestEmail });
    // Update the event with the new attendee
    await calendar.events.patch({
      calendarId: 'primary',
      eventId: event.googleEventId,
      requestBody: {
        attendees,
        status: 'confirmed', // Optionally mark it as confirmed
      },
    });

    return NextResponse.json({"message": "Your Event Has Been Booked!"});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error booking time slot' }, { status: 500 });
  }
}
