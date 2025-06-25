import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { Role, PlanStatus } from '@prisma/client'

/* map the plan string in Checkout metadata → enum Role */
export function planToRole(plan: 'plus' | 'base' | undefined): Role {
  switch (plan) {
    case 'plus':
      return Role.PLUS          // $12/mo
    case 'base':
      return Role.BASE          // $8/mo paid starter
    default:
      return Role.USER          // default after sign-up, no dashboard access
  }
}

export async function POST(req: NextRequest) {
  const sig  = req.headers.get('stripe-signature')!
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )
  } catch (err) {
    console.error('⚠️  Signature verification failed', err)
    return new NextResponse('Bad signature', { status: 400 })
  }

  /* ──────────────────────────────── */
  switch (event.type) {
    /* 1️⃣  First payment succeeds */
    case 'checkout.session.completed': {
      const s = event.data.object as Stripe.Checkout.Session
      await db.user.update({
        where: { id: s.metadata!.userId },
        data : {
          role         : planToRole(s.metadata!.plan as 'plus' | 'base'),
          planStatus   : PlanStatus.active,
          stripeCustomerId     : s.customer as string,
          stripeSubscriptionId : s.subscription as string,
        },
      })
      break
    }

    /* 2️⃣  Grace-period cancel or re-activate */
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription

      if (sub.cancel_at_period_end) {
        await db.user.update({
          where: { stripeSubscriptionId: sub.id },
          data : {
            planStatus      : PlanStatus.canceling,
            currentPeriodEnd: new Date(sub.items.data[0].current_period_end * 1000),
          },
        })
      } else if (sub.status === 'active') {
        await db.user.update({
          where: { stripeSubscriptionId: sub.id },
          data : { planStatus: PlanStatus.active },
        })
      } else if (sub.status === 'past_due') {
        await db.user.update({
          where: { stripeSubscriptionId: sub.id },
          data : { planStatus: PlanStatus.past_due },
        })
      }
      break
    }

    /* 3️⃣  Final deletion (period end or immediate) */
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await db.user.update({
        where: { stripeSubscriptionId: sub.id },
        data : {
          role                : Role.USER,          // ⬅️ back to free tier
          planStatus          : PlanStatus.canceled,
          stripeSubscriptionId: null,
          currentPeriodEnd    : null,
        },
      })
      break
    }
  }

  return new NextResponse(null, { status: 200 })
}
