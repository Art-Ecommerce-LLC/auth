import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  const { name, email, timeSlotId } = await request.json();

  // Convert the timeSlotId to a number
  const timeSlotInteger = parseInt(timeSlotId);

  try {
    // Step 1: Check if the time slot exists and if it's already booked
    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotInteger },
    });

    if (!timeSlot) {
      return NextResponse.json({ error: 'Time slot not found' }, { status: 404 });
    }

    if (timeSlot.isBooked) {
      return NextResponse.json({ error: 'Time slot already booked' }, { status: 400 });
    }

    // Step 2: Create the booking
    const booking = await prisma.booking.create({
      data: {
        name,
        email,
        timeSlotId: timeSlotInteger,
      },
    });

    // Step 3: Mark the time slot as booked
    await prisma.timeSlot.update({
      where: { id: timeSlotInteger },
      data: { isBooked: true },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error booking time slot' }, { status: 500 });
  }
}
