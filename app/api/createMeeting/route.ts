
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import db from '@/lib/db';
import { google } from 'googleapis';
import { decrypt } from '@/lib/encrypt';

const schema = z.object({
    dateTime: z.string(),
    guestEmail: z.string(),
    serviceToken: z.string(),
    description: z.string()
});

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

export async function POST(request : NextRequest) {

    // get the body of the request in a json
    try {
        const body = await request.json();
        const { dateTime, guestEmail, serviceToken, description } = schema.parse(body);
        
        
        // Check if the service token is valid
        const user = await db.user.findUnique({
            where: {
                serviceToken: serviceToken
            }
        })
    
        if (!user) {
            return NextResponse.json({error:"Invalid service token"}, {status:401})
        }
    
        // Get the booking with the datetime and see if it is available
        const event = await db.event.findUnique({
            where: {
                date: new Date(dateTime),
                isBooked: false
            }
        })
    
        // Update the booking with the guest email
        if (!event) {
            return NextResponse.json({error:"Event is already booked"}, {status:409})
        }
    
        await db.event.update({
            where: {
                id: event.id
            },
            data: {
                guestEmail: guestEmail,
                isBooked: true,
                description: description
            }
        })
    
        // Update the booking with the guest email with gapi
        if (!event) {
            return NextResponse.json({error:"Event is already booked"}, {status:409})
        }
    
        if (!user.googleToken) {
            return NextResponse.json({error:"User not found"}, {status:404})
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
            calendarId: '055f86c75a99c3985ff91566fe3705198573df32246426b79c8636e6af4b657a@group.calendar.google.com',
            eventId: event.googleEventId,
        });

        // Get the start and end times from the existing event
        const { start, end } = existingEvent.data;

        if (!start || !end) {
            return NextResponse.json({ error: 'Start or end time not found' }, { status: 404 });
        }

        // Extract and add timezone to start and end times
        const updatedStart = {
            dateTime: start.dateTime, // Use the existing event's start time
        };

        const updatedEnd = {
            dateTime: end.dateTime, // Use the existing event's end time
        };
            
        const attendees = existingEvent.data.attendees || [];
        attendees.push({ email: guestEmail });

        // Update the event with the new attendee
        await calendar.events.patch({
            calendarId: "055f86c75a99c3985ff91566fe3705198573df32246426b79c8636e6af4b657a@group.calendar.google.com",
            eventId: event.googleEventId,
            requestBody: {
                attendees,
                status: 'confirmed', // Optionally mark as confirmed
                start: updatedStart, // Include start with timezone
                end: updatedEnd, // Include end with timezone
                description: description
            },
            sendUpdates: 'all'
        });
        return NextResponse.json({"message": "Your Event Has Been Booked!"});
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error booking time slot' }, { status: 500 });
    }

}