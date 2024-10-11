import { NextResponse, NextRequest} from 'next/server';
import db from '@/lib/db';
// zod schema
import { z } from 'zod';
import { getSession } from '@/lib/dal';
import { decrypt } from '@/lib/encrypt';
import { google } from 'googleapis';
import { DateTime } from 'luxon';
import { convertToUTC } from '@/app/utils/dates';
import { addDays, addMinutes } from 'date-fns';
import { start } from 'repl';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  startDayHours: z.string().min(1, 'Start Day Hours is required'),
  startDayMinutes: z.string().min(1, 'Start Day Minutes is required'),
  startDayAbbreviation: z.string().min(1, 'Start Day Abbreviation is required'),
  endDayHours: z.string().min(1, 'End Day Hours is required'),
  endDayMinutes: z.string().min(1, 'End Day Minutes is required'),
  endDayAbbreviation: z.string().min(1, 'End Day Abbreviation is required'),
  appointmentLength: z.string().min(1, 'Appointment Length is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  dateRange: z.object({
    from: z.string().min(1, 'From is required'),
    to: z.string().min(1, 'To is required'),
  })
})

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);



export async function POST(request: NextRequest) {
  try {
  const body = await request.json(); 
  const { 
    title, 
    description, 
    startDayHours, 
    startDayMinutes, 
    startDayAbbreviation, 
    endDayHours ,
    endDayMinutes,
    endDayAbbreviation,
    appointmentLength,
    timezone,
    dateRange,
  } = schema.parse(body);
  
  const { from, to } = dateRange;



  const newFromDate = new Date(from);
  const newToDate = new Date(to);

  console.log('newFromDate:', newFromDate);
  console.log('newToDate:', newToDate);

  const startDay = newFromDate.getUTCDate();
  const startMonth = newFromDate.getUTCMonth() + 1; // getUTCMonth returns 0-based month
  const startYear = newFromDate.getUTCFullYear();
  const endDay = newToDate.getUTCDate();
  const endMonth = newToDate.getUTCMonth() + 1; // getUTCMonth returns 0-based month
  const endYear = newToDate.getUTCFullYear();

  // Example input format: "10/8/2024 - 01:03 PM PDT  -  timezone abbr is irrelevant"
  const utcToDate = `${endMonth}/${endDay}/${endYear} - ${endDayHours}:${endDayMinutes} ${endDayAbbreviation} PDT`;
  const utcFromDate = `${startMonth}/${startDay}/${startYear} - ${startDayHours}:${startDayMinutes} ${startDayAbbreviation} PDT`;
  const endDayTimeInterval = `${startMonth}/${startDay}/${startYear} - ${endDayHours}:${endDayMinutes} ${endDayAbbreviation} PDT`;


  const startDateTime = convertToUTC(utcFromDate, timezone);
  const endDateTime = convertToUTC(utcToDate, timezone);
  console.log('startDateTime:', startDateTime);
  console.log('endDateTime:', endDateTime);
  const endDateTimeDayInterval = convertToUTC(endDayTimeInterval, timezone);

  // Create the appointment slots

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
  
  if (!user.googleToken) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const decryptedGoogleTokens = await decrypt(user.googleToken);

  oauth2Client.setCredentials({
    access_token: decryptedGoogleTokens.accessToken,
    refresh_token: decryptedGoogleTokens.refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // Create the appointment slots for the start time of each day to the end time of each day. from the start date to the end date
  const slots = [];

  let startDateTimeLoop = startDateTime;
  let endDateTimeLoop = endDateTimeDayInterval;

  console.log('startDateTimeLoop:', startDateTimeLoop);
  console.log('EndDateTimeLoop:', endDateTimeLoop);

  while (startDateTimeLoop < endDateTime) {

    const startInterval = startDateTimeLoop;

    // Add the appointmentLength to the startDateTimeLoop
    startDateTimeLoop = addMinutes(startDateTimeLoop, Number(appointmentLength));

    slots.push({
      start : {
        dateTime: startInterval,
      },
      end: {
        dateTime: startDateTimeLoop,
      }
    });
// If we've reached or exceeded the end of the current day, move to the next day
    if (startDateTimeLoop.getTime() >= endDateTimeLoop.getTime()) {
      // Move to the next day by adding 1 day to both start and end of the day
      startDateTimeLoop = addDays(startDateTimeLoop, 1); // Set to the start time of the next day
      endDateTimeLoop = addDays(endDateTimeLoop, 1);     // Set the end time for the next day

      // Reset the time components for the next day's slots
      startDateTimeLoop.setHours(startDateTime.getHours());
      startDateTimeLoop.setMinutes(startDateTime.getMinutes());

      endDateTimeLoop.setHours(endDateTimeDayInterval.getHours());
      endDateTimeLoop.setMinutes(endDateTimeDayInterval.getMinutes());
    }

    // If we've reached or exceeded the global end date, stop the loop
    if (startDateTimeLoop.getTime() >= endDateTime.getTime()) {
      break;
    }
    }

  console.log('slots:', slots);

  for (const slot of slots) {
    // Create the event in the db first
    await db.event.create({
      data: {
        title,
        description,
        date: slot.start.dateTime,
        serviceToken: user.serviceToken,
      },
    });
    // Create the event in Google Calendar

    const eventRequest = {
        calendarId: '055f86c75a99c3985ff91566fe3705198573df32246426b79c8636e6af4b657a@group.calendar.google.com',
        resource: {
          summary: title,
          description,
          start: slot.start,
          end: slot.end,
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
        where: { date : slot.start.dateTime },
        data: {
          googleEventId: newGoogleEvent.data.id
        },
      });
  }

  return NextResponse.json({ message: 'Event created' }, { status: 201 });
} catch (error) {
  console.error('Error creating event:', error);
  return NextResponse.json({ error: 'Error creating event' }, { status: 500 });
}
}




  // if (!date) {
  //   return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
  // }

  // if (date < new Date()) {
  //   return NextResponse.json({ error: 'Date must be in the future' }, { status: 400 });
  // }

  // const session = await getSession();
  // const userId = session?.session?.userId;
  // if (!userId) {
  //   return NextResponse.json({ error: 'User not found' }, { status: 404 });
  // }

  // const user = await db.user.findUnique({
  //   where: { id: userId },
  //   select: { googleToken: true, serviceToken: true },
  // });

  // if (!user) {
  //   return NextResponse.json({ error: 'User not found' }, { status: 404 });
  // }

  // // Store the event in the database
  // await db.event.create({
  //   data: {
  //     title,
  //     description,
  //     date,
  //     serviceToken: user.serviceToken,
  //   },
  // });

  // if (!user) {
  //   return NextResponse.json({ error: 'User not found' }, { status: 404 });
  // }

  // if (!user.googleToken) {
  //   return NextResponse.json({ error: 'User not found' }, { status: 404 });
  // }

  // const decryptedGoogleTokens = await decrypt(user.googleToken);

  // oauth2Client.setCredentials({
  //   access_token: decryptedGoogleTokens.accessToken,
  //   refresh_token: decryptedGoogleTokens.refreshToken,
  // });

  // const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // const eventRequest = {
  //   calendarId: '055f86c75a99c3985ff91566fe3705198573df32246426b79c8636e6af4b657a@group.calendar.google.com',
  //   resource: {
  //     summary: title,
  //     description,
  //     start: {
  //       dateTime: date,
  //     },
  //     end: {
  //       dateTime: date,
  //     },
  //     conferenceData: {
  //       createRequest: {
  //         requestId: `meet-${Date.now()}`, // Unique ID for the request
  //         conferenceSolutionKey: {
  //           type: 'hangoutsMeet', // This specifies that it's a Google Meet event
  //         },
  //       },
  //     },
  //   },
  //   conferenceDataVersion: 1, // Enable conference data for Google Meet
  // };
  // const newGoogleEvent = await calendar.events.insert(eventRequest);
  // // Store the Google Event ID in the database
  // await db.event.update({
  //   where: { date },
  //   data: {
  //     googleEventId: newGoogleEvent.data.id
  //   },
  // });

  // return NextResponse.json({ message: 'Event created' }, { status: 201 });
 
