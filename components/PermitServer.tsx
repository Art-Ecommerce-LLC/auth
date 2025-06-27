// components/PermitServer.tsx
import DashboardClient from './DashboardClient';
import prisma from '@/lib/db';
interface PermitServerProps {
  userId: string;
}

export default async function PermitServer({ userId }: PermitServerProps) {
  const prismaPermits = await prisma.permit.findMany({
    where: {
      latitude:  { not: undefined },
      longitude: { not: undefined },
      // you could also scope by userId here if needed
      // userId: userId
    },
    orderBy: { issueDate: 'desc' },
  });

  return <DashboardClient permits={prismaPermits} />;
}
