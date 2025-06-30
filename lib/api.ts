import type { Permit as PrismaPermit } from '@prisma/client';

export async function fetchPermits(): Promise<PrismaPermit[]> {
  const res = await fetch('/api/permits', { cache: 'no-store' });
  if (res.status === 401) throw new Error('UNAUTHORIZED');
  if (res.status === 403) throw new Error('FORBIDDEN');
  if (!res.ok) throw new Error('NETWORK_ERROR');
  return res.json();
}
