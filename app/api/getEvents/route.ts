import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { google } from 'googleapis';
import { decrypt } from '@/lib/encrypt';

const schema = z.object({
    serviceToken: z.string()
});

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export async function POST(request: NextRequest) {
    try {
        // Parse the request body and validate
        const body = await request.json();
        const { serviceToken } = schema.parse(body);

        // Check if the service token is valid
        const user = await db.user.findUnique({
            where: {
                serviceToken: serviceToken
            }
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid service token" }, { status: 401 });
        }

        // Check if the user has Google tokens
        if (!user.googleToken) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Decrypt the user's google tokens
        const decryptedGoogleTokens = await decrypt(user.googleToken);

        // Set OAuth2 credentials
        oauth2Client.setCredentials({
            access_token: decryptedGoogleTokens.accessToken,
            refresh_token: decryptedGoogleTokens.refreshToken,
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        // Fetch the next available events from the Google Calendar
        const now = new Date().toISOString();

        const eventsResponse = await calendar.events.list({
            calendarId: '055f86c75a99c3985ff91566fe3705198573df32246426b79c8636e6af4b657a@group.calendar.google.com', // Change this to the calendar ID if it's different
            timeMin: now, // Get events starting from the current time
            maxResults: 10, // Limit to 10 upcoming events
            singleEvents: true,
            orderBy: 'startTime'
        });

        const events = eventsResponse.data.items || [];

        // Filter out booked events from your local DB
        const availableEvents = [];
        for (const event of events) {
            // Check if event.id is not null or undefined
            if (event.id) {
                const eventInDb = await db.event.findUnique({
                    where: {
                        googleEventId: event.id,  // Type-safe: event.id is guaranteed to be string
                        isBooked: false
                    }
                });

                if (eventInDb) {
                    const startUtc = new Date(event.start?.dateTime!).toISOString();
                    const endUtc = new Date(event.end?.dateTime!).toISOString();

                    availableEvents.push({
                        id: event.id,
                        summary: event.summary,
                        start: startUtc, // Return UTC time
                        end: endUtc, // Return UTC time
                    });
                }
            }
        }

        // If no available events, return an appropriate message
        if (availableEvents.length === 0) {
            return NextResponse.json({ message: "No available events found" }, { status: 200 });
        }
        console.log(availableEvents);
        // Return the next available events
        return NextResponse.json({ events: availableEvents }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching available events' }, { status: 500 });
    }
}
