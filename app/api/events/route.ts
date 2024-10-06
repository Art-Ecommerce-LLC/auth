import { NextResponse, NextRequest} from 'next/server';
import prisma from '@/lib/db';
// zod schema
import { z } from 'zod';



export async function POST(request: NextRequest) {
  try {
  const body = await request.json(); 
  console.log(body);
  return NextResponse.json({ message: 'Event created' }, { status: 201 });
 
  } catch (error) {

    return NextResponse.json({ error: 'Error creating event' }, { status: 500 });
  }
}
