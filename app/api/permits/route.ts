// app/api/permits/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { getSessionData } from '@/lib/dal';

export const revalidate = 300;

export async function GET(req: NextRequest) {
  const session = await getSessionData('session');
  if (!session.isAuth || !session.mfaVerified) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.role === 'USER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const permits = await prisma.permit.findMany({
    where: {
      latitude: { not: undefined },
      longitude: { not: undefined },
      // userId: session.userId, // if per-user scope
    },
    orderBy: { issueDate: 'desc' },
  });

  return NextResponse.json(permits);
}
