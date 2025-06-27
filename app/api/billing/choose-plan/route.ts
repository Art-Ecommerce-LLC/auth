// app/api/billing/choose-plan/route.ts
'use server';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import * as z from "zod";
import { getSessionData } from '@/lib/dal';

const PRICE_MAP: Record<'base' | 'plus', string> = {
  base: process.env.STRIPE_PRICE_BASE_ID!,
  plus: process.env.STRIPE_PRICE_PLUS_ID!,
};
// Define a schema for input Validation
const planSchema = z.object({
  plan: z.enum(['base','plus']),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { plan } = planSchema.parse(body);

  const sessionData = await getSessionData('session');

  if (!sessionData.mfaVerified) {
    return NextResponse.json({ error: 'MFA not verified' }, { status: 403 });
  }

  const priceId = PRICE_MAP[plan];
  if (!priceId) {
    return NextResponse.json({ error: 'Stripe price ID not configured for selected plan.' }, { status: 500 });
  }

  if (!sessionData.email) {
    return NextResponse.json({ error: 'User email not found in session.' }, { status: 400 });
  }


  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: sessionData.stripeCustomerId,
    client_reference_id: sessionData.userId,
    customer_email: sessionData.email,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    line_items: [
      { 
        price: PRICE_MAP[plan], 
        quantity: 1 
      }
    ],
    metadata: {
      userId: sessionData.userId!,
      plan: plan,
    },
  });
  console.log('Checkout session created:', checkout);
  return NextResponse.json({ url: checkout.url });
}
