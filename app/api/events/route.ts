import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { toZonedTime } from 'date-fns-tz'; // Import the conversion function



export async function POST(request: Request) {
  const { title, description, date, timeSlots, timezone } = await request.json();

    
  try {
    // Validate and construct time slot Date objects and convert to UTC
    const formattedTimeSlots = timeSlots.map((slot: { time: string }) => {
      // Combine the date and time into a valid ISO string
      const fullDateTime = `${slot.time}`; // Add seconds to the time string

      // Convert the local time to UTC using the provided timezone
      const UTCTimezone = 'UTC'; // UTC timezone
      const utcTimeSlotDate = toZonedTime(fullDateTime, UTCTimezone);

      if (isNaN(utcTimeSlotDate.getTime())) {
        throw new Error(`Invalid time slot: ${fullDateTime}`);
      }

      return {
        time: utcTimeSlotDate, // Store the UTC date
      };
    });

    // Create the event with valid UTC time slots
    console.log(formattedTimeSlots);
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date), // Store date as UTC (since date usually doesn't need time component)
        timeSlots: {
          create: formattedTimeSlots, // Time slots are now in UTC
        },
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating event' }, { status: 500 });
  }
}
