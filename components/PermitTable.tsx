'use client';

import { useState, useRef, useEffect } from 'react';
import type { Permit } from '@/types/permit';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableProps { permits: Permit[]; selectedId: string | null; onSelect: (id: string) => void; }

export default function PermitTable({ permits, selectedId, onSelect }: TableProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof Permit>('issue_date');
  const [sortAsc, setSortAsc] = useState(true);
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});

  useEffect(() => {
    if (selectedId && rowRefs.current[selectedId]) rowRefs.current[selectedId]!.scrollIntoView({ block: 'center' });
  }, [selectedId]);

  const sortBy = (key: keyof Permit) => { if (sortKey === key) setSortAsc(s => !s); else { setSortKey(key); setSortAsc(true); }};
  const filtered = permits
    .filter(p => (p.description ?? '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Handle sorting based on the type of the sortKey
      if (sortKey === 'lead_price') {
        // number
        return sortAsc
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
      if (sortKey === 'issue_date') {
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
    <Card>
      <CardHeader><CardTitle>Permit Dashboard</CardTitle></CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center space-x-2">
          <Input placeholder="Search by description…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="max-h-[540px] w-full overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-white shadow-sm"><tr>
              <th onClick={()=>sortBy('description')} className={cn('cursor-pointer px-4 py-2 text-left', sortKey==='description'&&'font-semibold text-primary')}>Description<ArrowUp/></th>
              <th onClick={()=>sortBy('issue_date')} className={cn('cursor-pointer px-4 py-2 text-left', sortKey==='issue_date'&&'font-semibold text-primary')}>Issue Date<ArrowUp /></th>
              <th onClick={()=>sortBy('lead_price')} className={cn('cursor-pointer px-4 py-2 text-left', sortKey==='lead_price'&&'font-semibold text-primary')}>Lead Price<ArrowUp /></th>
            </tr></thead>
            <tbody>
              {filtered.map(p=> (
                <tr key={p.permit_number} ref={el => { rowRefs.current[p.permit_number] = el; }} onClick={()=>onSelect(p.permit_number)} className={cn('cursor-pointer hover:bg-muted', selectedId===p.permit_number&&'bg-primary/10')}>
                  <td className="px-4 py-2" title={p.description||''}>{p.description?.slice(0,80)}{p.description&&p.description.length>80?'…':''}</td>
                  <td className="px-4 py-2">{new Intl.DateTimeFormat('en-US',{dateStyle:'medium'}).format(new Date(p.issue_date))}</td>
                  <td className={cn('px-4 py-2',p.lead_price&&p.lead_price>1000?'text-red-600':'text-green-600')}>{p.lead_price!=null?`$${p.lead_price.toFixed(2)}`:'—'}</td>
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
