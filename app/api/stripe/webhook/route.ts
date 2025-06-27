import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { stripe } from '@/lib/stripe'
import { Role, PlanStatus } from '@prisma/client'

function planToRole(plan: 'plus' | 'base'): Role {
  switch (plan) {
    case 'plus':
      return Role.PLUS
    case 'base':
      return Role.BASE
    default:
      throw new Error('Unknown plan type')
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
      try {
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
      } catch (err) {
        console.error('⚠️  Error updating user after checkout session:', err)
        return new NextResponse('Error updating user', { status: 500 })
      }
      
    }

    /* 2️⃣  Grace-period cancel or re-activate */
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      //  Check what role the user changed to
      if (sub.cancel_at) {
        await db.user.update({
          where: { stripeSubscriptionId: sub.id },
          data : {
            role                : Role.USER,          // ⬅️ back to free tier
            planStatus          : PlanStatus.canceling,
            currentPeriodEnd    : new Date(sub.items.data[0].current_period_end * 1000),
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

    case 'customer.subscription.deleted': {
  const sub = event.data.object as Stripe.Subscription;
  const periodEndTs = sub.items.data[0].current_period_end * 1000;
  const canceledAtTs = (sub.canceled_at ?? 0) * 1000;
  const periodEnd = new Date(periodEndTs);

  // If Stripe deleted the subscription before the period end,
  // the user still has paid-for time — keep their existing role.
  if (canceledAtTs < periodEndTs) {
    await db.user.update({
      where: { stripeSubscriptionId: sub.id },
      data: {
        planStatus:   PlanStatus.canceled,
        currentPeriodEnd: periodEnd,
        // role is unchanged (still PLUS or BASE)
      },
    });
  } else {
    // Subscription ended at or after period end → revoke premium access
    await db.user.update({
      where: { stripeSubscriptionId: sub.id },
      data: {
        role:         Role.USER,
        planStatus:   PlanStatus.canceled,
        currentPeriodEnd: periodEnd,
      },
    });
  }
  break;
    }
  }
  return new NextResponse(null, { status: 200 })
}