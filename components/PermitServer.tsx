// components/PermitServer.tsx
import DashboardClient from './DashboardClient'
import prisma from '@/lib/db'
import type { Permit } from '@/types/permit'

interface PermitServerProps {
  userId: string
}

export default async function PermitServer({ userId }: PermitServerProps) {
  // fetch only the permits you care about (e.g. with valid coords)
  const permits: Permit[] = await prisma.permit.findMany({
    where: {
      latitude:  { not: null },
      longitude: { not: null },
      // if you want to scope per user:
      // userId: userId
    },
    orderBy: { issueDate: 'desc' },
  })

  return <DashboardClient permits={permits} />
}
