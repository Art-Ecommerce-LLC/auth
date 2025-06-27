// components/PermitServer.tsx
import DashboardClient from './DashboardClient'
import prisma from '@/lib/db'
import type { Permit } from '@/types/permit'

interface PermitServerProps {
  userId: string
}

export default async function PermitServer({ userId }: PermitServerProps) {
  // fetch only the permits you care about (e.g. with valid coords)
  const prismaPermits = await prisma.permit.findMany({
    where: {
      latitude:  { not: undefined },
      longitude: { not: undefined },
      // if you want to scope per user:
      // userId: userId
    },
    orderBy: { issueDate: 'desc' },
  })

  // Map camelCase fields to snake_case as expected by Permit type
  const permits: Permit[] = prismaPermits.map((p) => ({
    id: p.id,
    permit_number: p.permitNumber,
    address: p.address,
    latitude: p.latitude,
    longitude: p.longitude,
    status: p.status,
    issue_date: p.issueDate,
    description: p.description,
    raw_hash: p.rawHash,
    urgency: p.urgency,
    project_value: p.projectValue,
    lead_price: p.leadPrice,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
    permit_type: p.permitType ?? '', // provide a sensible default if property is missing
    hotness: p.hotness ?? 0,         // or provide a sensible default
    reasoning_summary: p.reasoningSummary ?? '', // or provide a sensible default
  }))

  return <DashboardClient permits={permits} />
}
