// app/api/billing/upgrade/route.ts
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { getUser } from '@/lib/dal'

export async function POST() {
  /* 1 ▸ auth & fetch user */
  const user = await getUser()
  if (!('stripeSubscriptionId' in user)) {
    return NextResponse.json({ error: 'not allowed' }, { status: 403 })
  }
  if (!user.stripeSubscriptionId)
    return NextResponse.json({ error: 'no active sub' }, { status: 400 })

  /* 2 ▸ swap BASIC → PLUS */
  const sub = await stripe.subscriptions.retrieve(user.stripeSubscriptionId, {
    expand: ['items.data'],
  })
  const itemId = sub.items.data[0].id

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId!,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/plan`,
    flow_data: {
      type: 'subscription_update_confirm',
      subscription_update_confirm: {
        subscription: sub.id,
        items: [
          {
            id: itemId,
            price: process.env.STRIPE_PRICE_PLUS!, // target plan
          },
        ]
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/plan?upgraded=1`,
        },
      },
    },
  })

  return NextResponse.json({ url: session.url })
}
