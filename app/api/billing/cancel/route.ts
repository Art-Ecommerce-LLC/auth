'use server'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { cookies } from 'next/headers'
import { decrypt } from '@/lib/encrypt'
import db from '@/lib/db'

export async function POST(_req: NextRequest) {
  /* — auth — */
  const raw = (await cookies()).get('session')?.value
  if (!raw) return NextResponse.json({ error: 'unauth' }, { status: 401 })

  const { userId } = await decrypt(raw)
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user?.stripeSubscriptionId)
    return NextResponse.json({ error: 'no subscription' }, { status: 404 })

  /* — cancel at period end — */
  await stripe.subscriptions.update(user.stripeSubscriptionId, {
    cancel_at_period_end: true,
  })

  return NextResponse.json({ ok: true })
}
