'use server'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { decrypt } from '@/lib/encrypt'
import { cookies } from 'next/headers'
import db from '@/lib/db'

export async function POST() {
  const cookie = (await cookies()).get('session')?.value
  if (!cookie) return NextResponse.json({ error: 'unauth' }, { status: 401 })

  const { userId } = await decrypt(cookie)
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user)
    return NextResponse.json({ error: 'no customer' }, { status: 404 })

  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId!,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/plan`,
  })

  return NextResponse.json({ url: portal.url })
}
