// app/api/billing/choose-plan/route.ts
'use server';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import * as z from "zod";
import { decrypt } from '@/lib/encrypt';
import { cookies } from 'next/headers';
import db from "@/lib/db";
import { hash } from 'bcrypt';

const PRICE_MAP: Record<'base' | 'plus', string> = {
  base: process.env.STRIPE_PRICE_BASE!,
  plus: process.env.STRIPE_PRICE_PLUS!,
};

// Define a schema for input Validation
const planSchema = z.object({
  plan: z.enum(['base','plus']),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { plan } = planSchema.parse(body);

  // Check if the user is authenticated  
  const session = (await cookies()).get('session');

  if (!session) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  // Decrypt the session cookie
  const sessionData = await decrypt(session.value);

  // Get the user from the db
  const user = await db.user.findUnique({
    where: { id: sessionData.userId },
  });

  if (!user) {
    console.error('No user found for session:', sessionData);
    return NextResponse.json({ error: 'No User Found' }, { status: 403 });
  }

  const userSession = await db.session.findUnique({
    where: { id: sessionData.sessionId },
  });

  if (!userSession) {
    console.error('No user session found for token:', sessionData);
    return NextResponse.json({ error: 'No User Session Found' }, { status: 403 });
  }

  if (!userSession.mfaVerified) {
    return NextResponse.json({ error: 'MFA not verified' }, { status: 403 });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.email,
    line_items: [
      { 
        price: PRICE_MAP[plan],
        quantity: 1 }

    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/select-plan`,
    metadata   : { userId: user.id, plan },
    // optional: automatic_tax: { enabled: true },
  });
  console.log('Checkout session created:', checkout);
  return NextResponse.json({ url: checkout.url });
}
