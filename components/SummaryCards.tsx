'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Permit as PrismaPermit } from '@prisma/client';

interface Props { permits: PrismaPermit[]; }
export default function SummaryCards({ permits }: Props) {
  const total = permits.length;
  const high = permits.filter(p => p.urgency === 'high').length;
  const medium = permits.filter(p => p.urgency === 'medium').length;
  const low = permits.filter(p => p.urgency === 'low').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { title: 'Total Permits', value: total },
        { title: 'High Urgency', value: high },
        { title: 'Medium Urgency', value: medium },
        { title: 'Low Urgency', value: low },
      ].map(card => (
        <Card key={card.title} className="flex flex-col items-center justify-center p-4">
          <CardHeader>
            <CardTitle className="text-sm text-gray-500 uppercase tracking-wide">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-semibold text-gray-800">
              {card.value}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
