import { NextResponse } from 'next/server';
import { getSessionData } from '@/lib/dal';
import db from '@/lib/db';

export async function POST(req: Request) {
  const session = await getSessionData('session');
  const { role } = await req.json();

  if (!session.isAuth || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await db.user.update({
      where: { id: session.userId },
      data: { profession: role },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update role:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}
