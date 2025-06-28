'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import SummaryCards from './SummaryCards';
import FilterPanel from './FilterPanel';
import PermitTable from './PermitTable';           // default import of default-exported component
import PermitMap from './PermitMap';  
import type { Permit as PrismaPermit } from '@prisma/client';

interface DashboardClientProps {
  permits: PrismaPermit[];
}
export default function DashboardClient({ permits }: DashboardClientProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() =>
    permits
      .filter(
        p =>
          roleFilter === 'all' ||
          (Array.isArray(p.recommendedRoles) &&
            p.recommendedRoles.includes(roleFilter))
      )
      .filter(p => p.description?.toLowerCase().includes(search.toLowerCase())),
    [permits, roleFilter, search]
  );

  const markerData = useMemo(
    () => filtered.map(p => ({ id: p.permitNumber, lat: p.latitude, lon: p.longitude })),
    [filtered]
  );

  return (
    <div className="p-6 space-y-6">

      <SummaryCards permits={filtered} />

      <div className="flex flex-col md:flex-row gap-6">
        <FilterPanel
          roles={Array.from(
            new Set(
              permits
                .flatMap(p => p.recommendedRoles || [])
                .filter((role): role is string => typeof role === 'string')
            )
          )}
          selectedRole={roleFilter}
          onRoleChange={setRoleFilter}
          search={search}
          onSearchChange={setSearch}
        />

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="h-[600px] overflow-auto">
            <CardHeader><CardTitle>Permits List</CardTitle></CardHeader>
            <CardContent className="p-0">
              <PermitTable
                permits={filtered}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            </CardContent>
          </Card>

          <Card className="h-[600px]">
        <CardHeader><CardTitle>Map View</CardTitle></CardHeader>
        <CardContent className="p-0 h-full">
          <div className="h-full">
            <PermitMap
              permits={markerData}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}

