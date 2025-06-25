'use server'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { decrypt } from '@/lib/encrypt'
import { cookies } from 'next/headers'
import db from '@/lib/db'

const PRICE_MAP = {
  plus : process.env.STRIPE_PRICE_PLUS!,
  base : process.env.STRIPE_PRICE_BASE!,    // may be unused if free
}

export async function POST(req: NextRequest) {
  const plan = req.nextUrl.searchParams.get('to') as 'plus' | 'base'
  if (!plan) return NextResponse.json({ error: 'missing plan' }, { status: 400 })

  const cookie = (await cookies()).get('session')?.value
  if (!cookie) return NextResponse.json({ error: 'unauth' }, { status: 401 })

  const { userId } = await decrypt(cookie)
  const user = await db.user.findUnique({ where: { id: userId } })
  if (!user) return NextResponse.json({ error: 'no user' }, { status: 404 })

  /* Free → Paid or Paid → Other price: new Checkout session */
  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.email,
    line_items: [{ price: PRICE_MAP[plan], quantity: 1 }],
    allow_promotion_codes: true,
    metadata: { userId, plan },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/plan?success=true`,
    cancel_url : `${process.env.NEXT_PUBLIC_APP_URL}/settings/plan?canceled=true`,
  })

  return NextResponse.json({ url: checkout.url })
}
