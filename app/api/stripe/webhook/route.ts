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

        const subscriptionSchedule = await stripe.subscriptionSchedules.create({
          from_subscription: s.subscription as string,
          end_behavior: 'cancel',
        })

        //  Get the plan status from the subscription schedule
        const subscription = await stripe.subscriptions.retrieve(s.subscription as string)
        const planStatus = subscription.status

        await db.user.update({
          where: { id: s.metadata!.userId },
          data : {
            role         : planToRole(s.metadata!.plan as 'plus' | 'base'),
            planStatus   : planStatus as PlanStatus,
            currentPeriodEnd: new Date(subscriptionSchedule.phases[0].end_date * 1000), // Convert seconds to milliseconds
            stripeCustomerId     : s.customer as string,
            stripeSubscriptionId : s.subscription as string,
            stripeScheduleId     : subscriptionSchedule.id,
          },
        })
      } catch (err) {
        console.error('⚠️  Error updating user after checkout session:', err)
        return new NextResponse('Error updating user', { status: 500 })
      }
      
    }

    // Anytime a user updates their subscription they have already established and are paying for, this will be called.
    // 
    case 'customer.subscription.updated': {
      // There are a few cases to handle:
      //1. The user is on Base plan and wants to update to Plus plan. Therefore, Change there role to PLUS.
      //2. The user is on Plus plan and wants to update to Base plan. Therefore, Change there role to BASE.
      //3. The user is on Plus plan and wants to cancel their subscription. Dont change their role, but change their planStatus to canceled.
      //4. The user is on Base plan and wants to cancel their subscription. Dont change their role, but change their planStatus to canceled.
      const sub       = event.data.object as Stripe.Subscription
      const nowSec    = Math.floor(Date.now() / 1000)
      const item      = sub.items.data[0]
      const priceMap: Record<string, 'base' | 'plus'> = {
        [process.env.STRIPE_PRICE_BASE_ID!]: 'base',
        [process.env.STRIPE_PRICE_PLUS_ID!]: 'plus',
      }
      const newPlan   = priceMap[item.price.id] // 'base' or 'plus'
      const newStatus = sub.status as PlanStatus
      const cancelAt  = sub.cancel_at
       // 1 & 2: active + plan change
      if (newStatus === 'active' || newStatus === 'trialing') {
        await db.user.update({
          where: { stripeSubscriptionId: sub.id },
          data: {
            role:       planToRole(newPlan),  // BASE or PLUS
            planStatus: newStatus as PlanStatus,
            currentPeriodEnd: new Date(item.current_period_end * 1000),
          },
        })
        break
      }
      // 3 & 4: canceled
      if (newStatus === 'canceled' || (cancelAt && cancelAt < nowSec)) {
        await db.user.update({
          where: { stripeSubscriptionId: sub.id },
          data: {
            // leave role as-is (BASE or PLUS)
            planStatus: newStatus as PlanStatus,
            currentPeriodEnd: new Date(item.current_period_end * 1000),
          },
        })
        break
      }
      if (newStatus === 'past_due') {
        await db.user.update({
          where: { stripeSubscriptionId: sub.id },
          data: { planStatus: newStatus as PlanStatus, role: Role.USER, currentPeriodEnd: new Date(item.current_period_end * 1000) },
        })
      }
    }
    case 'customer.subscription.deleted': {
    const sub = event.data.object as Stripe.Subscription;
    const status = sub.status as PlanStatus;
    const periodEndTs = sub.items.data[0].current_period_end * 1000;
    const canceledAtTs = (sub.canceled_at ?? 0) * 1000;
    const periodEnd = new Date(periodEndTs);

    // If Stripe deleted the subscription before the period end,
    // the user still has paid-for time — keep their existing role.
    if (canceledAtTs < periodEndTs) {
      await db.user.update({
        where: { stripeSubscriptionId: sub.id },
        data: {
          planStatus:   status as PlanStatus,
          currentPeriodEnd: periodEnd,
        },
      });
    } else {
      // Subscription ended at or after period end → revoke premium access
      await db.user.update({
        where: { stripeSubscriptionId: sub.id },
        data: {
          role:         Role.USER,
          planStatus:   status as PlanStatus,
          currentPeriodEnd: periodEnd,
        },
      });
    }
  break;
    }
  }
  return new NextResponse(null, { status: 200 })
}