// lib/require-paid.ts
import { getSessionData } from '@/lib/dal'
import { Role, PlanStatus } from '@prisma/client'
import { redirect } from 'next/navigation'

export async function requirePaidUser() {
  const session = await getSessionData('session')

  if (!session.isAuth || !session.mfaVerified) redirect('/sign-in')

  const user = session.user as {
    role: Role
    planStatus: PlanStatus
    currentPeriodEnd?: Date | null
  }

  const { role, planStatus } = user

  const hasAccess =
    role === Role.ADMIN ||
    (planStatus !== PlanStatus.canceled &&
      (role === Role.PLUS || role === Role.BASE))

  if (!hasAccess) redirect('/select-plan')

  return user          // so pages can still read currentPeriodEnd, etc.
}
