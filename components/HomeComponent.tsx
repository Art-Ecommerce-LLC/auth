'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center bg-background text-foreground px-6 pt-20">
      {/* Hero Section */}
      <section className="max-w-4xl text-center space-y-6">
        <h1 className="text-4xl md:text-5xl font-bold">
          Know Before They Build.
        </h1>
        <p className="text-lg text-muted-foreground">
          Permit Pulse sends real-time alerts and lets you explore new building permits in Encinitas — perfect for contractors, realtors, and local pros.
        </p>
        <Link href="/signup">
          <Button size="lg">Get Alerts & Dashboard Access – $20/mo</Button>
        </Link>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mt-24 w-full space-y-8 text-center">
        <h2 className="text-3xl font-semibold">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            ['Sign Up', 'Create your account and select your professional role.'],
            ['Get Real-Time Alerts', 'Be notified instantly when relevant permits are issued.'],
            ['Explore the Dashboard', 'Use filters, maps, and tables to find new leads.'],
          ].map(([title, desc], i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-4xl mt-24 w-full text-center space-y-6">
        <h2 className="text-3xl font-semibold">Simple, Fair Pricing</h2>
        <p className="text-muted-foreground">
          Dashboard access includes real-time alerts. Buy high-value leads separately.
        </p>
        <Card className="mx-auto max-w-md">
          <CardHeader>
            <CardTitle>$20/month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <ul className="list-disc text-left pl-5">
              <li>Access the live permit dashboard</li>
              <li>Get real-time permit alerts</li>
              <li>Filter by project value, type, urgency</li>
              <li>Optional: purchase enriched leads</li>
            </ul>
            <Link href="/signup">
              <Button className="mt-4 w-full">Start Now</Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* FAQ & Footer Links */}
      <section className="max-w-3xl mt-24 w-full text-center space-y-4">
        <h3 className="text-xl font-semibold">FAQs</h3>
        <p className="text-muted-foreground text-sm">
          Don’t worry — if no permits are issued, you still have full dashboard access and historic data.
        </p>
        <p className="text-muted-foreground text-sm">
          Data comes directly from the city of Encinitas and is updated hourly.
        </p>
      </section>

      <footer className="mt-24 text-center text-sm text-muted-foreground pb-10">
        © {new Date().getFullYear()} Permit Pulse. All rights reserved.
      </footer>
    </main>
  );
}
