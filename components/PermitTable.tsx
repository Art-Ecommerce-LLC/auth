'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Permit as PrismaPermit } from '@prisma/client';

interface TableProps { permits: PrismaPermit[]; selectedId: string | null; onSelect: (id: string) => void; }

export default function PermitTable({ permits, selectedId, onSelect }: TableProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof PrismaPermit>('issueDate');
  const [sortAsc, setSortAsc] = useState(true);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  useEffect(() => {
    if (selectedId && rowRefs.current[selectedId]) rowRefs.current[selectedId]!.scrollIntoView({ block: 'center' });
  }, [selectedId]);

  const sortBy = (key: keyof PrismaPermit) => { if (sortKey === key) setSortAsc(s => !s); else { setSortKey(key); setSortAsc(true); }};
  const filtered = permits
    .filter(p => (p.description ?? '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (sortKey === 'issueDate') {
        // string (date)
        const aDate = new Date(aVal as string).getTime();
        const bDate = new Date(bVal as string).getTime();
        return sortAsc ? aDate - bDate : bDate - aDate;
      }
      // description (string)
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  return (
    <Card className="w-full mx-auto my-6">
      <CardContent>
        <div className="mb-4 flex items-center space-x-2">
          <Input placeholder="Search by description…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="max-h-[540px] w-full overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-white shadow-sm"><tr>
              <th onClick={()=>sortBy('description')} className={cn('cursor-pointer px-4 py-2 text-left', sortKey==='description'&&'font-semibold text-primary')}>Description</th>
              <th onClick={()=>sortBy('issueDate')} className={cn('cursor-pointer px-4 py-2 text-left', sortKey==='issueDate'&&'font-semibold text-primary')}>Issue Date</th>
              {/* Add urgency column */}
              <th onClick={()=>sortBy('urgency')} className={cn('cursor-pointer px-4 py-2 text-left', sortKey==='urgency'&&'font-semibold text-primary')}>Urgency</th>
            </tr></thead>
            <tbody>
              {filtered.map(p=> (
                <tr key={p.permitNumber} ref={el => { rowRefs.current[p.permitNumber] = el; }} onClick={()=>onSelect(p.permitNumber)} className={cn('cursor-pointer hover:bg-muted', selectedId===p.permitNumber&&'bg-primary/10')}>
                  <td className="px-4 py-2" title={p.description||''}>{p.description?.slice(0,80)}{p.description&&p.description.length>80?'…':''}</td>
                  <td className="px-4 py-2">{new Intl.DateTimeFormat('en-US',{dateStyle:'medium'}).format(new Date(p.issueDate))}</td>
                  {/* Add urgency column */}
                  <td className="px-4 py-2 w-10">{p.urgency}</td>
                </tr>
              ))}
              {filtered.length===0&&<tr><td colSpan={3} className="px-4 py-2 text-center text-muted-foreground">No permits found.</td></tr>}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
