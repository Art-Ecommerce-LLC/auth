import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { DateTime } from 'luxon';

// You no longer need the timezoneMap if you're using Luxon’s `setZone` method directly.
const timezoneMap: Record<string, string> = {
  'America/New_York': 'America/New_York',
  'America/Chicago': 'America/Chicago',
  'America/Denver': 'America/Denver',
  'America/Los_Angeles': 'America/Los_Angeles',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  const timezone = searchParams.get('timezone'); // Capture the user's timezone

  try {
    if (!timezone) {
      return NextResponse.json({ error: 'Timezone is required' }, { status: 400 });
    }

    const userTimezone = timezoneMap[timezone]; // Get the full IANA timezone name from the map

    if (!userTimezone) {
      return NextResponse.json({ error: 'Invalid timezone' }, { status: 400 });
    }

    // If a date is provided, fetch time slots for that specific date
    if (dateParam) {
      // Use Luxon to handle the start and end of the day
      const startOfDay = DateTime.fromISO(dateParam, { zone: userTimezone }).startOf('day').toUTC();
      const endOfDay = DateTime.fromISO(dateParam, { zone: userTimezone }).endOf('day').toUTC();

      console.log('startOfDayUTC:', startOfDay.toISO());
      console.log('endOfDayUTC:', endOfDay.toISO());

      // Fetch all time slots within this UTC range
      const timeSlots = await db.timeSlot.findMany({
        where: {
          time: {
            gte: startOfDay.toJSDate(),
            lte: endOfDay.toJSDate(),
          },
          isBooked: false,
        },
      });

      // Convert time slots back to user's timezone for display
      const timeSlotsInUserTimezone = timeSlots.map(slot => ({
        ...slot,
        time: DateTime.fromJSDate(slot.time).setZone(userTimezone).toISO(),
      }));

      return NextResponse.json(timeSlotsInUserTimezone);

    } else {
      // If no date is provided, return all future available time slots in user's timezone
      const now = DateTime.now().setZone(userTimezone).toUTC();

      console.log('now:', now.toISO());
      const timeSlots = await db.timeSlot.findMany({
        where: {
          time: {
            gte: now.toJSDate(),
          },
          isBooked: false,
        },
      });

      // Convert the UTC time slots to the user's timezone
      const timeSlotsInUserTimezone = timeSlots.map(slot => ({
        ...slot,
        time: DateTime.fromJSDate(slot.time).setZone(userTimezone).toISO(),
      }));

      console.log('timeSlotsInUserTimezone', timeSlotsInUserTimezone);

      // Extract unique dates from the time slots
      const uniqueDates = timeSlotsInUserTimezone.reduce((dates: string[], slot) => {
        const dateString = DateTime.fromISO(slot.time!).toFormat('yyyy-MM-dd');
        if (!dates.includes(dateString)) {
          dates.push(dateString);
        }
        return dates;
      }, []);

      console.log('uniqueDates', uniqueDates);

      return NextResponse.json(uniqueDates);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching time slots' }, { status: 500 });
  }
}
